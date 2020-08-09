import React, { useEffect, useState, useRef } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import MarkerGenerator from './marker_generator';

import { CONSTS } from '../../consts/const_messages';
import './map.scss';


const AdminMap = withScriptjs(withGoogleMap((props) => {

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
        defaultZoom={5}
        defaultCenter={CONSTS.JERUSALEM_POSITION}
        defaultOptions={options}
    >
    </GoogleMap>
}
));

export default AdminMap;