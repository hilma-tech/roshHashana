import React, { useState } from 'react'

import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";

const SHOFAR_BLOWER = 'shofar_blower';
const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';

const MarkerGenerator = (props) => {
    // locationInfo, icon, label, position,

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const closeOrOpenInfoWindow = () => {
        setIsInfoWindowOpen(isInfoWindowOpen => !isInfoWindowOpen);
    }

    if (!props.locationInfo || typeof props.locationInfo !== "object" || Array.isArray(props.locationInfo)) return null;
    const { info, location, type } = props.locationInfo;
    if (!location || !location.lng || !location.lat) return null;

    const icon = {
        url: type === PRIVATE_MEETING ? '/icons/single-blue.svg' : type === SHOFAR_BLOWER ? 'icons/my_location.svg' : '/icons/group-orange.svg',
        scaledSize: type === PRIVATE_MEETING ? new window.google.maps.Size(50, 50) : type === SHOFAR_BLOWER ? new window.google.maps.Size(50, 50) : new window.google.maps.Size(85, 85),
        origin: new window.google.maps.Point(0, 0),
        anchor: type === SHOFAR_BLOWER ? new window.google.maps.Point(35, -5):new window.google.maps.Point(13, 5), // changes position of icon
    }

    return (
        <Marker
            icon={props.icon ? props.icon : icon}
            lable={props.label ? props.label : ''}
            onClick={closeOrOpenInfoWindow}
            position={props.position ? props.position : { lat: location.lat, lng: location.lng }}>
            {info && isInfoWindowOpen && <InfoWindow onCloseClick={closeOrOpenInfoWindow}>{info}</InfoWindow>}
        </Marker>
    );
}
export default MarkerGenerator;