import React, { useState, useEffect } from 'react'

import { Polyline, withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";
import MarkerGenerator from './marker_generator';


const SHOFAR_BLOWER = 'shofar_blower';
const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';


const MyMapDirectionsRenderer = (props) => {
    const [state, setState] = useState({
        directions: null,
        error: null,
        lineCoordinates: null,
    });
    const { places } = props; // [{ location: {}, isPublic: t/f,  }, { location: {} }]

    useEffect(() => {
        console.log('places: ', places);
        const travelMode = window.google.maps.TravelMode.WALKING
        const waypoints = places.map(p => ({
            location: p.location,
            stopover: true
        }))
        const origin = waypoints.shift().location;
        const destination = waypoints.length ? waypoints.pop().location : null;

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: travelMode,
                waypoints: waypoints
            },
            (result, status) => {
                console.log('result: ', result);
                if (status === window.google.maps.DirectionsStatus.OK) {
                    const overViewCoords = result.routes[0].overview_path;
                    setState(state => ({ ...state, lineCoordinates: overViewCoords, directions: result }));
                } else {
                    console.log('ERROR result: ', result);
                    setState(state => ({ ...state, error: result }));
                }
            }
        );
    }, [])

    if (state.error) {
        return <h1>{state.error}</h1>;
    }
    let isOrigin = false; let locationInfo;
    return (
        <div>
            <Polyline
                path={state.lineCoordinates}
                geodesic={false}
                options={{
                    strokeColor: '#82C0CC',
                    strokeOpacity: "62%",
                    strokeOpacity: 1,
                    strokeWeight: 7,
                }}
            />
            {
                places.map((place, i, arr) => {
                    isOrigin = i == arr.length - 1;
                    locationInfo = { location: place.location, ...place.markerOptions }
                    // if(isOrigin) return null
                    return <MarkerGenerator key={i} locationInfo={locationInfo} icon={place.icon || null} label={place.label || null} />
                })
            }
        </div>
    );
}

export default MyMapDirectionsRenderer;

