import React, { useEffect, useState } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import Geocode from "react-geocode";
import { CONSTS } from '../../consts/const_messages';
// import './map.scss';
import { fetchShofarBlowersForMap, fetchBlastsForMap, fetchIsolatedForMap } from '../../scenes/admin/fetch_and_utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))

const AdminMap = withScriptjs(withGoogleMap((props) => {

    const [center, setCenter] = useState(CONSTS.JERUSALEM_POSITION);
    const [zoom, setZoom] = useState(10);
    const [shofarBlowers, setShofarBlowers] = useState([])
    const [blasts, setBlasts] = useState([])
    const [isolateds, setIsolateds] = useState([])

    const [showShofarBlowers, setShowShofarBlowers] = useState(false)
    const [showBlasts, setShowBlasts] = useState(false)
    const [showIsolateds, setShowIsolateds] = useState(false)

    useEffect(() => {
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
    }, []);

    const zoomPlace = (place) => {
        setZoom(18)
        setCenter(place);
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
        onZoomChanged={(num) => setZoom(num)}
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
                <img src='icons/shofar-blue.svg' alt='' />
                <div className='textInHover blueBackground bold'>בעלי תקיעה</div>
            </div>
            <div className={'mapIconContainer lightblueText pointer' + (showBlasts ? ' mapIconSelected' : '')} onClick={showBlastsMarkers}>
                <img src='icons/group.svg' alt='' />
                <div className='textInHover lightblueBackground bold'>תקיעות</div>
            </div>
            <div className={'mapIconContainer orangeText pointer' + (showIsolateds ? ' mapIconSelected' : '')} onClick={showIsolatedsMarkers}>
                <img src='icons/singleOrange.svg' alt='' />
                <div className='textInHover orangeBackground bold'>מחפשים</div>
            </div>
        </div>
        {showShofarBlowers && shofarBlowers.map((shofarBlower, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/shofar-blue.svg',
                        scaledSize: { width: 25, height: 25 },
                        anchor: { x: 12.5, y: 12.5 }
                    }
                }}
                position={{ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }) }}
            />
        )}
        {showBlasts && blasts.map((blast, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/group.svg',
                        scaledSize: { width: 25, height: 25 },
                        anchor: { x: 12.5, y: 12.5 }
                    }
                }}
                position={{ lat: Number(blast.lat), lng: Number(blast.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(blast.lat), lng: Number(blast.lng) }) }}
            />
        )}
        {showIsolateds && isolateds.map((isolated, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/singleOrange.svg',
                        scaledSize: { width: 25, height: 25 },
                        anchor: { x: 12.5, y: 12.5 }
                    }
                }}
                position={{ lat: Number(isolated.lat), lng: Number(isolated.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(isolated.lat), lng: Number(isolated.lng) }) }}
            />
        )}
    </GoogleMap>
}
));

export default AdminMap;