import React, { useEffect, useState, useContext } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import Geocode from "react-geocode";
import { CONSTS } from '../../consts/const_messages';
import './adminMap.scss';
import { fetchShofarBlowersForMap, fetchBlastsForMap, fetchIsolatedForMap } from '../../scenes/admin/fetch_and_utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AdminMainContext } from '../../scenes/admin/ctx/AdminMainContext';
import { withRouter } from 'react-router';

import { useSocket, useJoinLeave } from "@hilma/socket.io-react";
const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))

const AdminMap = withScriptjs(withGoogleMap((props) => {
    const [center, setCenter] = useState(props.center || CONSTS.JERUSALEM_POSITION);
    const [zoom, setZoom] = useState(props.zoom || 10);
    const [shofarBlowers, setShofarBlowers] = useState([])
    const [blasts, setBlasts] = useState([])
    const [isolateds, setIsolateds] = useState([])
    const [showShofarBlowers, setShowShofarBlowers] = useState(false)
    const [showBlasts, setShowBlasts] = useState(false)
    const [showIsolateds, setShowIsolateds] = useState(false)
    const [selectedMarkerId, setSelectedMarkerId] = useState('')

    const { setSelectedIsolator, selectedIsolator, setSelectedSB } = useContext(AdminMainContext)
    const socket = useSocket();
    useJoinLeave('blower-events', (err) => {
        if (err) console.log("failed to join room blower-events");
    })

    useEffect(() => {
        socket.on('newMeetingAssigned', handleNewMeeting)
        const input = document.getElementById('search-input');
        let autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.setComponentRestrictions({ country: "il" });
        autocomplete.addListener("place_changed", () => {
            let place = autocomplete.getPlace();
            if (place.geometry) {
                zoomPlace(place.geometry.location)
            }
            else if (!place.geometry && place.name) {
                //find the lat and lng of the place
                findLocationCoords(place.name);
            }
            else return;
        })
        if (selectedIsolator) {
            showShofarBlowersMarkers()
        }
        else showIsolatedsMarkers()
        return () => {
            socket.off('newMeetingAssigned', handleNewMeeting);
        }
    }, []);

    const handleNewMeeting = (req) => {
        setIsolateds(prevIsolateds => {
            if (prevIsolateds.length !== 0) {
                let isolateds = [...prevIsolateds]
                isolateds = isolateds.filter((isolated) => (isolated.isolatedId !== req.isolatedId))
                return isolateds
            } else {
                return prevIsolateds;
            }
        })
    };
    const zoomPlace = (place, userId = '') => {
        setZoom(18)
        setCenter(place);
        if (userId !== '') setSelectedMarkerId(userId)
    }

    // const zoomOut = () => {
    //     setCenter(CONSTS.JERUSALEM_POSITION);
    //     setZoom(10)
    // }

    const showShofarBlowersMarkers = () => {
        setShowShofarBlowers(prev => !prev)
        if (shofarBlowers.length > 0) return
        fetchShofarBlowersForMap((err, res) => {
            if (!err) {
                setShofarBlowers(res)
            }
        })
    }

    const showBlastsMarkers = () => {
        setShowBlasts(prev => !prev)
        if (blasts.length > 0) return
        fetchBlastsForMap((err, res) => {
            if (!err) {
                setBlasts(res)
            }
        })
    }

    const showIsolatedsMarkers = () => {
        setShowIsolateds(prev => !prev)
        if (isolateds.length > 0) return
        fetchIsolatedForMap((err, res) => {
            if (!err) {
                setIsolateds(res)
            }
        })
    }

    const findLocationCoords = async (address) => {
        let [error, res] = await to(Geocode.fromAddress(address));
        if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
        try {
            const newCenter = res.results[0].geometry.location;
            if (newCenter !== center) {
                zoomPlace(newCenter)
            }
        } catch (e) { console.log(`ERROR getting ירושלים geoCode, res.results[0].geometry.location `, e); }
    }

    const onInfoWindowSBClick = async (userId) => {
        // console.log('setSelectedSB: userId ', userId);
        setSelectedSB({ userId })
        // setIsFromIsolator(true)
        props.history.push('/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/shofar-blower')
    }

    const handleSBClick = (sb) => {
        setSelectedSB({ userId: sb.userId })
        selectedIsolator && typeof selectedIsolator === "object" && props.history.push('/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/shofar-blower')
        zoomPlace({ lat: Number(sb.lat), lng: Number(sb.lng) }, 'shofarBlower-' + sb.userId)
    }

    const onInfoWindowIsolatedClick = (isolated) => {
        setSelectedIsolator(isolated)
        props.history.push('/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/searcher')
    }

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

    return <GoogleMap
        zoom={zoom}
        onZoomChanged={() => setZoom(null)}
        center={center}
        defaultOptions={options}
    >
        <div className='mapNavContainer'>
            <div className="inputContainer" >
                <input
                    id="search-input"
                    type="text"
                    placeholder="חיפוש"
                />
                <FontAwesomeIcon icon={['fas', 'search']} className='inputIcon' />
            </div>
            <div className={'mapIconContainer blueText pointer' + (showShofarBlowers ? ' mapIconSelected' : '')} onClick={showShofarBlowersMarkers}>
                <img src='/icons/shofar-blue.svg' alt='' />
                <div className='textInHover blueBackground bold'>בעלי תקיעה</div>
            </div>
            <div className={'mapIconContainer lightblueText pointer' + (showBlasts ? ' mapIconSelected' : '')} onClick={showBlastsMarkers}>
                <img src='/icons/group.svg' alt='' />
                <div className='textInHover lightblueBackground bold'>תקיעות</div>
            </div>
            <div className={'mapIconContainer orangeText pointer' + (showIsolateds ? ' mapIconSelected' : '')} onClick={showIsolatedsMarkers}>
                <img src='/icons/singleOrange.svg' alt='' />
                <div className='textInHover orangeBackground bold'>מחפשים</div>
            </div>
        </div>

        {showShofarBlowers && shofarBlowers.map((shofarBlower, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: '/icons/shofar-blue.svg',
                        scaledSize: { width: 25, height: 25 },
                        anchor: { x: 12.5, y: 12.5 }
                    }
                }}
                position={{ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }}
                zIndex={0}
                onClick={() => { handleSBClick(shofarBlower) }}
            >
                {selectedMarkerId.split('-')[0] === 'shofarBlower' && shofarBlower.userId === Number(selectedMarkerId.split('-')[1]) &&
                    <InfoWindow onCloseClick={() => { setSelectedMarkerId('') }}>
                        <div className="infoWindowContainer">
                            <div className="infoWindowTitle bold blueText">בעל תוקע</div>
                            <div className="pubShofarBlowerNameContainer">
                                <img alt="" src='/icons/shofar.svg' />
                                <div>{shofarBlower.name}</div>
                            </div>
                            <div className="pubAddressContainer">
                                <img alt="" src='/icons/address.svg' />
                                <div>{shofarBlower.address}</div>
                            </div>
                            {/* <div className="pub-address-container" ><FontAwesomeIcon className="icon-on-map-locationInfo" icon="phone" /><div>{shofarBlower.username}</div></div> */}
                            <div className='infoWindowButton pointer' onClick={() => onInfoWindowSBClick(shofarBlower.userId)}>{!selectedIsolator ? 'לעוד פרטים' : 'שבץ'}</div>
                        </div>
                    </InfoWindow>
                }
            </Marker>
        )}
        {showBlasts && blasts.map((blast, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: '/icons/group.svg',
                        scaledSize: { width: 25, height: 25 },
                        anchor: { x: 12.5, y: 12.5 }
                    }
                }}
                position={{ lat: Number(blast.lat), lng: Number(blast.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(blast.lat), lng: Number(blast.lng) }, 'blast-' + blast.id) }}
            >
                {selectedMarkerId.split('-')[0] === 'blast' && blast.id === Number(selectedMarkerId.split('-')[1]) &&
                    <InfoWindow onCloseClick={() => { setSelectedMarkerId('') }}>
                        <div className="infoWindowContainer">
                            <div className="infoWindowTitle bold blueText">{blast.isPublicMeeting ? 'תקיעה ציבורית' : 'תקיעה פרטית'}</div>
                            <div className="pubShofarBlowerNameContainer">
                                <img alt="" src='/icons/shofar.svg' />
                                <div>{blast.blowerName}</div>
                            </div>
                            <div className="pubAddressContainer">
                                <img alt="" src='/icons/address.svg' />
                                <div>{blast.address}</div>
                            </div>
                            {/* <div className="pubAddressContainer" >
                                <FontAwesomeIcon className="icon-on-map-locationInfo" icon="phone" />
                                <div>{blast.username}</div>
                            </div> */}
                            {/* <div className='infoWindowButton pointer' onClick={() => onInfoWindowIsolatedClick(blast.id, blast.isPublicMeeting)}>{!selectedIsolator ? 'לעוד פרטים' : 'שבץ'}</div> */}
                        </div>
                    </InfoWindow>
                }
            </Marker>
        )}

        {showIsolateds && isolateds.map((isolated, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: '/icons/singleOrange.svg',
                        scaledSize: { width: 25, height: 25 },
                        anchor: { x: 12.5, y: 12.5 }
                    }
                }}
                position={{ lat: Number(isolated.lat), lng: Number(isolated.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(isolated.lat), lng: Number(isolated.lng) }, 'isolated-' + isolated.isolatedId) }}
            >
                {selectedMarkerId.split('-')[0] === 'isolated' && isolated.isolatedId === Number(selectedMarkerId.split('-')[1]) &&
                    <InfoWindow onCloseClick={() => { setSelectedMarkerId('') }}>
                        <div className="infoWindowContainer">
                            <div className="infoWindowTitle bold blueText">מחפש/ת</div>
                            <div className="pubShofarBlowerNameContainer">
                                <img alt="" src='/icons/shofar.svg' />
                                <div>{isolated.name}</div>
                            </div>
                            <div className="pubAddressContainer">
                                <img alt="" src='/icons/address.svg' />
                                <div>{isolated.address}</div>
                            </div>
                            {/* <div className="pub-address-container" ><FontAwesomeIcon className="icon-on-map-locationInfo" icon="phone" /><div>{shofarBlower.username}</div></div> */}
                            <div className='infoWindowButton pointer' onClick={() => onInfoWindowIsolatedClick(isolated)}>{!selectedIsolator ? 'לעוד פרטים' : 'שבץ'}</div>
                        </div>
                    </InfoWindow>
                }
            </Marker>
        )}
        {!showIsolateds && selectedIsolator &&
            <Marker
                options={{
                    icon: {
                        url: '/icons/singleOrange.svg',
                        scaledSize: { width: 35, height: 35 },
                        anchor: { x: 17.5, y: 17.5 }
                    }
                }}
                position={{ lat: Number(selectedIsolator.lat), lng: Number(selectedIsolator.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(selectedIsolator.lat), lng: Number(selectedIsolator.lng) }) }}
            >
                <InfoWindow onCloseClick={() => { }}>
                    <div className="infoWindowContainer">
                        <div className="infoWindowTitle bold blueText">מחפש/ת</div>
                        <div className="pubShofarBlowerNameContainer">
                            <img alt="" src='/icons/shofar.svg' />
                            <div>{selectedIsolator.name}</div>
                        </div>
                        <div className="pubAddressContainer">
                            <img alt="" src='/icons/address.svg' />
                            <div>{selectedIsolator.address}</div>
                        </div>
                        {/* <div className="pub-address-container" ><FontAwesomeIcon className="icon-on-map-locationInfo" icon="phone" /><div>{shofarBlower.username}</div></div> */}
                        {/* <div className='infoWindowButton pointer' onClick={() => onInfoWindowIsolatedClick(isolated.id)}>{!selectedIsolator ? 'לעוד פרטים' : 'שבץ'}</div> */}
                    </div>
                </InfoWindow>
            </Marker>
        }
    </GoogleMap>
}
));

export default withRouter(AdminMap);