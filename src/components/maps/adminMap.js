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

        fetchShofarBlowers()
        fetchBlasts()
        fetchIsolateds()
    }, []);

    const zoomPlace = (place) => {
        setCenter(place);
        setZoom(18)
    }

    // const zoomOut = () => {
    //     setCenter(CONSTS.JERUSALEM_POSITION);
    //     setZoom(10)
    // }

    const fetchShofarBlowers = () => {
        fetchShofarBlowersForMap((err, res) => {
            if (!err) {
                setShofarBlowers(res)
            }
        })
    }

    const fetchBlasts = () => {
        fetchBlastsForMap((err, res) => {
            if (!err) {
                setBlasts(res)
            }
        })
    }

    const fetchIsolateds = () => {
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
            <div className={'mapIconContainer' + ' mapIconSelected'}>
                <img src='icons/single-orange.svg' alt='' />
                <div className='textInHover'>מחפשים</div>
            </div>
        </div>
        {shofarBlowers.map((shofarBlower, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/shofar-blue.svg',
                        scaledSize: { width: 30, height: 30 },
                        anchor: { x: 15, y: 15 }
                    }
                }}
                position={{ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }) }}
            />
        )}
        {blasts.map((blast, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/group.svg',
                        scaledSize: { width: 30, height: 30 },
                        anchor: { x: 15, y: 15 }
                    }
                }}
                position={{ lat: Number(blast.lat), lng: Number(blast.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(blast.lat), lng: Number(blast.lng) }) }}
            />
        )}
        {isolateds.map((isolated, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/singleOrange.svg',
                        scaledSize: { width: 30, height: 30 },
                        anchor: { x: 15, y: 15 }
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