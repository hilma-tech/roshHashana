import React, { useState } from 'react'

import { Marker, InfoWindow } from "react-google-maps";

const PRIVATE_MEETING = 'private meeting';

const MarkerGenerator = (props) => {
    // locationInfo, icon, label, position,
    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const closeOrOpenInfoWindow = () => {
        setIsInfoWindowOpen(isInfoWindowOpen => !isInfoWindowOpen);
    }

    if (!props.position && (!props.locationInfo || typeof props.locationInfo !== "object" || Array.isArray(props.locationInfo))) return null;

    if (props.locationInfo) {
        var { info, location, type } = props.locationInfo;
        if (!location || !location.lng || !location.lat) return null;
    }

    let url = (type === PRIVATE_MEETING) ? (props.isolated || props.blower) ? '/icons/single.svg' : '/icons/single-blue.svg' : (props.isolated || props.blower) ? '/icons/group.svg' : '/icons/group-orange.svg';

    const icon = props.icon ? props.icon : {
        url: url,
        scaledSize: (type === PRIVATE_MEETING) ? ((props.isolated || props.blower) ? new window.google.maps.Size(50, 50) : new window.google.maps.Size(50, 50)) : new window.google.maps.Size(50, 50), // the svg borders and margins משפיעים here
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(25, 25), // changes position of icon
    }

    return (
        <Marker
            icon={icon}
            label={props.label ? props.label : ''}
            onClick={closeOrOpenInfoWindow}
            position={(props.position && Object.keys(props.position).length) ? props.position : location ? { lat: location.lat, lng: location.lng } : null}>
            {!props.isolated && info && isInfoWindowOpen && <InfoWindow onCloseClick={closeOrOpenInfoWindow}>{info}</InfoWindow>}
        </Marker>
    );
}
export default MarkerGenerator;