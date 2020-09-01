import React, { useEffect, useState } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
// import MarkerGenerator from './marker_generator';
import Geocode from "react-geocode";
import { CONSTS } from '../../consts/const_messages';
// import './map.scss';
import { fetchShofarBlowersForMap } from '../../scenes/admin/fetch_and_utils';

const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))

const AdminMap = withScriptjs(withGoogleMap((props) => {

    const [center, setCenter] = useState(CONSTS.JERUSALEM_POSITION);
    const [zoom, setZoom] = useState(10);
    const [shofarBlowers, setShofarBlowers] = useState([])

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
            <div id="inputContainer" >
                <input
                    id="search-input"
                    type="text"
                    placeholder="חיפוש"
                />
                <img id="inputIcon" alt="" src="/icons/search.svg" />
            </div>
        </div>
        {shofarBlowers.map((shofarBlower, index) =>
            <Marker
                key={index}
                options={{
                    icon: {
                        url: 'icons/single-blue.svg',
                        scaledSize: { width: 35, height: 35 },
                        anchor: { x: 17.5, y: 17.5 }
                    }
                }}
                position={{ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }}
                zIndex={0}
                onClick={() => { zoomPlace({ lat: Number(shofarBlower.lat), lng: Number(shofarBlower.lng) }) }}
            />
        )}
    </GoogleMap>
}
));

export default AdminMap;