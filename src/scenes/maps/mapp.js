import React, { useEffect, useState, useRef } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow } from "react-google-maps";
import Geocode from "react-geocode";
import _ from "lodash";
import Auth from '../../modules/auth/Auth';
import './map.scss';

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
    // componentRestrictions: { country: "il" },
    // restriction: {
    //     latLngBounds: polygonBounds(israelPolygon),
    //     strictBounds: false
    // }
};

const SHOFAR_BLOWER = 'shofar_blower';
const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';

const MapComp = (props) => {

    const [allLocations, setAllLocations] = useState([]);
    const [center, setCenter] = useState({});
    const [isMarkerShown, setIsMarkerShown] = useState(false);
    const [mapInfo, setMapInfo] = useState({});

    useEffect(() => {
        (async () => {

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
            if (props.publicMap) await setPublicMapContent();
            let [error, res] = await to(Geocode.fromAddress("ירושלים"))
            if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
            try {
                const newCenter = res.results[0].geometry.location;
                if (newCenter !== center) setCenter(newCenter)
            } catch (e) { console.log(`ERROR getting ירושלים geoCode, res.results[0].geometry.location `, e); }
        })();
    }, [mapInfo])


    const setPublicMapContent = async () => {

        //private meetings
        mapInfo && mapInfo.privateMeetings && mapInfo.privateMeetings.forEach(async privateMeet => { // isolated location (private meetings)
            const address = privateMeet.cityMeeting + ' ' + privateMeet.streetMeeting + ' ' + privateMeet.appartment;
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(privateMeet.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    type: PRIVATE_MEETING,
                    location: { lat, lng },
                    info: <div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
                        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{privateMeet.blowerName}</div></div>
                        <div>לא ניתן להצטרף לתקיעה זו</div></div>
                }

                setAllLocations(allLocations => Array.isArray(allLocations) ? [...allLocations, newLocObj] : [newLocObj])
            } catch (e) { console.log("err setPublicMapContent, ", e); }
        });

        mapInfo && mapInfo.publicMeetings && mapInfo.publicMeetings.forEach(async pub => { //public meetings location
            const address = pub.city + ' ' + pub.street;
            const [error, response] = await to(Geocode.fromAddress(address));
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(isolated.address): ${error}`); return; }
            try {
                const time = `${new Date(pub.start_time).getHours() + ':' + new Date(pub.start_time).getMinutes()}`
                const { lat, lng } = response.results[0].geometry.location;
                let newLocObj = {
                    type: SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    info: <div id="info-window-container">
                        <div className="info-window-header">תקיעה ציבורית</div>
                        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{pub.blowerName}</div></div>
                        <div id="pub-address-container"><img src={'/icons/address.svg'} /><div>{address}</div></div>
                        <div id="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{time}</div></div>
                        <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
                        <div className="notes">יש להצטרף לתקיעה על מנת להתעדכן</div>
                        <div id="join-button" className="clickAble" onClick={() => joinPublicMeeting(pub)}>הצטרף לתקיעה</div>
                    </div>
                };
                setAllLocations(allLocations => Array.isArray(allLocations) ? [...allLocations, newLocObj] : [newLocObj])
            } catch (e) { console.log("cought Geocode.fromAddress(pub.address)==", address, " : ", e); return; }
        });
    }

    const joinPublicMeeting = async (meetingInfo) => {
        console.log(props)
        props.history.push('/register', { type: 'generalUser', meetingInfo })
    }

    return (
        <div id="map-container" className={'slide-in-bottom'}>
            <MyMapComponent
                changeCenter={setCenter}
                allLocations={allLocations}
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}
                isMarkerShown={isMarkerShown}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<img src='/icons/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
            <div className="close-map clickAble" onClick={props.closeMap}>^</div>
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
        defaultZoom={20}
        defaultOptions={options}
        // bounds={31.4117257, 35.0818155}
        center={props.center}
    >
        <SearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />
        {props.isMarkerShown && <Marker position={props.center} />} {/* my location */}
        {props.allLocations && Array.isArray(props.allLocations) && props.allLocations.map((locationInfo, index) => {
            return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* all blowing meetings locations */
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
            props.changeCenter(place.geometry.location);
        })
    }, []);

    return (
        <div id="search-input-container">
            <input
                id="search-input"
                type="text"
                placeholder="חיפוש"
            />
            <img id="search-icon" src="/icons/search.svg" />
        </div>
    );
}


const MarkerGenerator = (props) => {

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const closeOrOpenInfoWindow = () => {
        setIsInfoWindowOpen(isInfoWindowOpen => !isInfoWindowOpen);
    }

    const { info, location, type } = props.locationInfo;
    const icon = {
        url: type === PRIVATE_MEETING ? '/icons/single-blue.svg' : '/icons/group-orange.svg',
        scaledSize: type === PRIVATE_MEETING ? new window.google.maps.Size(50, 50) : new window.google.maps.Size(85, 85),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(0, 0)
    }

    return (
        <Marker
            icon={icon}
            onClick={closeOrOpenInfoWindow}
            position={{ lat: location.lat, lng: location.lng }}>
            {isInfoWindowOpen && <InfoWindow onCloseClick={closeOrOpenInfoWindow}>{info}</InfoWindow>}
        </Marker>
    );
}