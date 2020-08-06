import React, { useEffect, useState, useRef } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps";
import MarkerGenerator from './marker_generator';
import { isBrowser } from 'react-device-detect';
import Auth from '../../modules/auth/Auth';
import Geocode from "react-geocode";
import './map.scss';
import moment from 'moment'
const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))
const israelCoords = [
    { lat: 32.863532, lng: 35.889902 },
    { lat: 33.458826, lng: 35.881345 },
    { lat: 33.107715, lng: 35.144508 },
    { lat: 31.296718, lng: 34.180102 },
    { lat: 29.486869, lng: 34.881321 },
    { lat: 29.551662, lng: 34.984779 },
];

var mapOptions = {
    fullscreenControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    disableDefaultUI: true,
    clickableIcons: false
};

const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';

const MapComp = (props) => {
    const [allLocations, setAllLocations] = useState([]);
    const [center, setCenter] = useState({});
    const [selfLocation, setSelfLocation] = useState({});
    const [userLocation, setIsMarkerShown] = useState(false);
    const [mapInfo, setMapInfo] = useState({});

    useEffect(() => {
        (async () => {
            unmounted = true
            let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/getMapData?isPubMap=${props.publicMap || false}`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (mapContent) {
                setMapInfo(mapContent);
            }
        })();

    }, []);

    useEffect(() => {
        (async () => {
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
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
    }, [mapInfo])

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
                            <div>לא ניתן להצטרף לתקיעה זו</div></div>
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
            const date = pub.start_time ? moment(pub.start_time).format("HH:mm") : 'לא נקבעה עדיין שעה';
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
                                < div className="notes">ייתכנו שינויי בזמני התקיעות</div>
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
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<img alt="" className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
            {(props.publicMap || !isBrowser) && <div className={`${isBrowser ? 'close-map ' : 'close-map-mobile'} clickAble`} onClick={props.closeMap}><img src='/icons/goUp.svg' /></div>}
        </div>
    );
}

export default MapComp;




const MyMapComponent = withScriptjs(withGoogleMap((props) => {

    let options = mapOptions;
    var israelPolygon = new window.google.maps.Polygon({
        paths: israelCoords,
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
            return <MarkerGenerator key={index} blower={props.blower} isolated={props.isolated} locationInfo={locationInfo} isolated={props.isolated} /> /* all blowing meetings locations */
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