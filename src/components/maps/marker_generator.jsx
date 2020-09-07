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
        scaledSize: (type === PRIVATE_MEETING) ? ((props.isolated || props.blower) ? new window.google.maps.Size(50, 50) : new window.google.maps.Size(30, 30)) : new window.google.maps.Size(50, 50), // the svg borders and margins משפיעים here
        origin: new window.google.maps.Point(0, 0),
        anchor: (type === PRIVATE_MEETING) ? ((props.isolated || props.blower) ? new window.google.maps.Point(25, 25) : new window.google.maps.Point(15, 15)) : new window.google.maps.Point(25, 25), // changes position of icon
    }
    return (
        <Marker
            icon={icon}
            label={props.label ? props.label : ''}
            onClick={closeOrOpenInfoWindow}
            position={(props.position && typeof props.position === "object" && Object.keys(props.position).length) ? props.position : location ? { lat: location.lat, lng: location.lng } : null}
        >
            {!props.isolated && info && isInfoWindowOpen && <InfoWindow onCloseClick={closeOrOpenInfoWindow}>{info}</InfoWindow>}
        </Marker>
    );
}
export default MarkerGenerator;



export const SBMarkerGenerator = ({ iconUrl: iconUrlProps, location, info, markerIcon, iconType, defaultInfoState = false, onClick }) => {
    /**
     * icon: overrides props.type
     * location
     * info: info window on click
     * iconType: type of meeting, so we know the right icon
     **/

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(defaultInfoState);

    const closeOrOpenInfoWindow = () => setIsInfoWindowOpen(isInfoWindowOpen => !isInfoWindowOpen)

    if (!location || !location.lng || !location.lat) return null;
    let latNum = Number(location.lat)
    let lngNum = Number(location.lng)
    if (isNaN(latNum) || isNaN(lngNum)) return null

    let iconUrl = iconUrlProps || ((iconType === PRIVATE_MEETING) ? '/icons/single-blue.svg' : '/icons/group-orange.svg')

    const icon = markerIcon || {
        url: iconUrl,
        scaledSize: (iconType === PRIVATE_MEETING) ? new window.google.maps.Size(30, 30) : new window.google.maps.Size(30, 30), // the svg borders and margins משפיעים here
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(15, 15), // changes position of icon
    }

    return (
        <Marker
            icon={icon}
            onClick={closeOrOpenInfoWindow}
            position={new window.google.maps.LatLng(latNum, lngNum)}
            onClick={onClick || undefined}
        >
            {info && isInfoWindowOpen ? <InfoWindow onCloseClick={closeOrOpenInfoWindow}>{info}</InfoWindow> : null}
        </Marker>
    );
}