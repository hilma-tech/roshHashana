import React, { useEffect, useState } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import { useSocket, useJoinLeave, useOn } from "@hilma/socket.io-react";
import { CONSTS } from '../../consts/const_messages';
import MarkerGenerator from './marker_generator';
import { isBrowser } from 'react-device-detect';
import Auth from '../../modules/auth/Auth';
import Geocode from "react-geocode";
import moment from 'moment'
import './map.scss';
const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))
const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';

const MapComp = (props) => {
    const [allLocations, setAllLocations] = useState([]);
    const [center, setCenter] = useState({});
    const [selfLocation, setSelfLocation] = useState({});
    const [userLocation, setIsMarkerShown] = useState(false);
    const [mapInfo, setMapInfo] = useState({});
    const socket = useSocket();

    useEffect(() => {
        (async () => {
            let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/getMapData?isPubMap=${props.publicMap || false}`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (err){console.log(err)}
            if (mapContent) {
                setMapInfo(mapContent);
            }
        })();
    }, []);


    useJoinLeave('blower-events', () => (err) => {
        if (err) console.log("failed to join room");
    });

    useJoinLeave("isolated-events", (err) => {
        if (err) console.log("failed to join room isolated-events");
    });

    const handleRemoveMeeting = (req) => {
        setMapInfo((currMapInfo) => {
            let publicMeetings = currMapInfo.publicMeetings.slice();
            let privateMeetings = currMapInfo.privateMeetings.slice();
            if (req.isPublicMeeting) {//public meeting
                let index = publicMeetings.findIndex((meet) => req.meetingId == meet.meetingId);
                publicMeetings.splice(index, 1);
            }
            else {//private meeting
                let index = publicMeetings.findIndex((meet) => req.meetingId == meet.meetingId);
                privateMeetings.splice(index, 1);
            }
            setAllLocations((allLoc) => {
                //set all locations to an empty array because we want to update all locations according to the new data inside mapinfo
                return [];
            })

            return { privateMeetings, publicMeetings };
        });
    };

    useEffect(() => {
        socket.on('newMeetingAssined', handleNewMeeting);
        return () => {
            socket.off('newMeetingAssined', handleNewMeeting);
        }
    }, []);

    useOn('removeMeetingWithBlower', (req) => {
        req.isPublicMeeting = req.public_meeting;
        handleRemoveMeeting(req);
    });

    useEffect(() => {
        socket.on('removeMeetingFromRoute', handleRemoveMeeting);
        return () => {
            socket.off('removeMeetingFromRoute', handleRemoveMeeting);
        }
    }, []);

    useEffect(() => {
        (async () => {
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY_SECOND);
            Geocode.setLanguage("he");
            if (props.publicMap && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    let newCenter = { lat: position.coords.latitude, lng: position.coords.longitude };
                    if (newCenter !== center) {
                        setCenter(newCenter);
                        setSelfLocation(newCenter);
                    }
                }, await findLocationCoords('ירושלים'));
            }
            else {
                if (!props.meetAddress && !Object.keys(mapInfo).length) return;
                let address = props.meetAddress || "";
                if (mapInfo.userAddress && mapInfo.userAddress[0].address) {
                    const position = { lat: parseFloat(mapInfo.userAddress[0].lat), lng: parseFloat(mapInfo.userAddress[0].lng) };
                    setCenter(position);
                    setSelfLocation(position);
                }
                address && await findLocationCoords(address, true);
            }
            await setPublicMapContent();
            setIsMarkerShown(true);
        })();
    }, [mapInfo]);

    const handleNewMeeting = (req) => {
        setMapInfo((currMapInfo) => {
            let publicMeetings = currMapInfo.publicMeetings.slice();
            let privateMeetings = currMapInfo.privateMeetings.slice();
            if (req.isPublicMeeting) {//public meeting
                req.start_time = req.meetingStartTime;
                publicMeetings.push(req);
            }
            else {//private meeting
                delete req.meetingStartTime;
                privateMeetings.push(req);
            }
            return { publicMeetings, privateMeetings }
        });
    };

    const findLocationCoords = async (address, isSelfLoc = false) => {
        let [error, res] = await to(Geocode.fromAddress(address));
        if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
        try {
            const newCenter = res.results[0].geometry.location;
            if (newCenter !== center) setCenter(newCenter);
            if (isSelfLoc) {
                setSelfLocation(newCenter);
            }
        } catch (e) { console.log(`ERROR getting ירושלים geoCode, res.results[0].geometry.location `, e); }
    }

    const setPublicMapContent = async () => {
        //private meetings
        mapInfo && mapInfo.privateMeetings && mapInfo.privateMeetings.forEach(async privateMeet => { // isolated location (private meetings)
            if (!privateMeet.address) return
            const lat = parseFloat(privateMeet.lat), lng = parseFloat(privateMeet.lng);
            setSelfLocation(selfLocation => {
                if (props.publicMap || (lat !== selfLocation.lat && lng !== selfLocation.lng)) {
                    const newLocObj = {
                        type: PRIVATE_MEETING,
                        location: { lat, lng },
                        info: <div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
                            <div className="pub-shofar-blower-name-container"><img alt="" src={'/icons/shofar.svg'} /><div>{privateMeet.blowerName}</div></div>
                            {props.blower ? null : <div>לא ניתן להצטרף לתקיעה זו</div>}
                        </div>
                    }
                    setAllLocations(allLocations => Array.isArray(allLocations) ? [...allLocations, newLocObj] : [newLocObj])
                }
                return selfLocation;
            });
        });

        mapInfo && mapInfo.publicMeetings && mapInfo.publicMeetings.forEach(async pub => { //public meetings location
            if (!pub.address) return
            const comments = pub.commennts ? pub.commennts : ' '
            const address = pub.address + ' ' + comments;
            const date = pub.start_time ? moment(pub.start_time).format("HH:mm") : 'טרם נקבעה שעה';
            const lat = parseFloat(pub.lat), lng = parseFloat(pub.lng);
            setSelfLocation(selfLocation => {
                if (props.publicMap || (lat !== selfLocation.lat && lng !== selfLocation.lng)) {
                    let newLocObj = {
                        type: SHOFAR_BLOWING_PUBLIC,
                        location: { lat, lng },
                        info: <div id="info-window-container">
                            <div className="info-window-header">תקיעה ציבורית</div>
                            <div className="pub-shofar-blower-name-container"><img alt="" src={'/icons/shofar.svg'} /><div>{pub.blowerName}</div></div>
                            <div className="pub-address-container">
                                <img alt="" src={'/icons/address.svg'} />
                                <div style={{ textAlign: "right" }}>
                                    {address}
                                </div>
                            </div>
                            <div className="pub-start-time-container"><img alt="" src={'/icons/clock.svg'} /><div>{date}</div></div>
                            {!props.blower && <>
                                <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
                                <div className="notes">יש להצטרף לתקיעה על מנת להתעדכן</div>
                                <div className="join-button clickAble" onClick={() => joinPublicMeeting(pub)}>הצטרף לתקיעה</div>
                            </>}
                        </div >
                    };
                    setAllLocations(allLocations => Array.isArray(allLocations) ? [...allLocations, newLocObj] : [newLocObj])
                }
                return selfLocation
            })
        });
    }

    const joinPublicMeeting = async (meetingInfo) => {
        if (props.publicMap) {
            props.history.push('/register', { type: 'generalUser', meetingInfo });
        }
    }

    return (
        <div className={`map-container ${props.settings ? 'fade-in' : (!props.publicMap && isBrowser) ? 'slide-in-top' : 'slide-in-bottom'}`} style={{ width: (!props.publicMap && isBrowser) ? '60%' : '100%' }}>
            <MyMapComponent
                publicMap={props.publicMap}
                settings={props.settings}
                selfLocation={selfLocation}
                meetAddress={props.meetAddress ? props.meetAddress : null}
                isolated={props.isolated}
                blower={props.blower}
                findLocationCoords={findLocationCoords}
                changeCenter={setCenter}
                allLocations={allLocations}
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}
                userLocation={userLocation}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
            {(props.publicMap || !isBrowser) && <div className={`${isBrowser ? 'close-map ' : 'close-map-mobile'} clickAble`} onClick={props.closeMap}><img alt="" src='/icons/goUp.svg' /></div>}
        </div>
    );
}

export default MapComp;


const MyMapComponent = withScriptjs(withGoogleMap((props) => {

    let options = CONSTS.MAP_OPTIONS;
    var israelPolygon = new window.google.maps.Polygon({
        paths: CONSTS.ISRAEL_COORDS,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });

    var bounds = new window.google.maps.LatLngBounds();
    if (!israelPolygon || typeof israelPolygon.getPaths !== "function" || !israelPolygon.getPaths() || typeof israelPolygon.getPaths().getLength !== "function")
        return null
    for (var i = 0; i < israelPolygon.getPaths().getLength(); i++) {
        for (var j = 0; j < israelPolygon.getPaths().getAt(i).getLength(); j++) {
            bounds.extend(israelPolygon.getPaths().getAt(i).getAt(j));
        }
    }
    options.restriction = {
        latLngBounds: bounds,
        strictBounds: false
    }

    const userLocationIcon = {
        url: props.meetAddress ? '/icons/meetAddress.svg' : props.blower ? '/icons/startRoute.svg' : '/icons/youHere.svg',
        scaledSize: new window.google.maps.Size(90, 90),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(45, 45),
    }


    return <GoogleMap
        defaultZoom={20}
        defaultOptions={options}
        center={props.center}
    >
        <SearchBoxGenerator settings={props.settings} publicMap={props.publicMap} changeCenter={props.changeCenter} center={props.center} findLocationCoords={props.findLocationCoords} />
        {props.userLocation ? <MarkerGenerator position={props.selfLocation} icon={userLocationIcon} meetAddress={props.meetAddress} /> : null} {/* my location */}
        {props.allLocations && Array.isArray(props.allLocations) && props.allLocations.map((locationInfo, index) => {
            return <MarkerGenerator key={index} blower={props.blower} isolated={props.isolated} locationInfo={locationInfo} /> /* all blowing meetings locations */
        })}
    </GoogleMap>
}
));

const SearchBoxGenerator = (props) => {

    useEffect(() => {
        const input = document.getElementById('search-input');
        let autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({ "country": "il" });
        autocomplete.addListener("place_changed", () => {
            let place = autocomplete.getPlace();
            if (place.geometry) props.changeCenter(place.geometry.location);
            else if (!place.geometry && place.name) {
                //find the lat and lng of the place
                props.findLocationCoords(place.name);
            }
            else return;
        })
    }, []);

    return (
        <div id="search-input-container" >
            <input
                id="search-input"
                type="text"
                placeholder="חיפוש"
            />
            <img id="search-icon" alt="" src="/icons/search.svg" />
        </div>
    );
}