import React, { useEffect, useState, useRef } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow } from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import Geocode from "react-geocode";
import _ from "lodash";
import './map.scss';
import db from '../db.json';


const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))

const mapOptions = {
    fullscreenControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    componentRestrictions: { country: "il" }
};

const SHOFAR_BLOWER = 'shofar_blower';
const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const ISOLATED = 'isolated';

const MapComp = (props) => {

    const [allLocations, setAllLocations] = useState([])
    const [center, setCenter] = useState({})
    const [isMarkerShown, setIsMarkerShown] = useState(false)

    useEffect(() => {
        (async () => {
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
            Geocode.setLanguage("he");
            if (props.publicMap) await setPublicMapContent();
            else if (props.sbMap) await setSBMapContent()
            let [error, res] = await to(Geocode.fromAddress("ירושלים"))
            if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
            try {
                const newCenter = res.results[0].geometry.location;
                setCenter(newCenter)
            } catch (e) { console.log(`ERROR getting ירושלים geoCode, res.results[0].geometry.location `, e); }
        })()
    }, [])

    const setPublicMapContent = async () => {
        // open meetings (suggestion)
        db.isolateds.forEach(async isolated => { // isolated location (private meetings)
            let [error, response] = await to(Geocode.fromAddress(isolated.address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(isolated.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const shofarBlowerName = db.shofarlowers.find((shofarBlower) => shofarBlower.id === isolated.shofarBlowerId).name;
                const newLocObj = {
                    type: ISOLATED,
                    location: { lat, lng },
                    info: <div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
                        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{shofarBlowerName}</div></div>
                        <div>לא ניתן להצטרף לתקיעה זו</div></div>
                }
                setAllLocations(allLocations => Array.isArray(allLocations) ? [...allLocations, newLocObj] : [newLocObj])
            } catch (e) { console.log("err setPublicMapContent, ", e); }
        });

        db.pubSHofarBlowing.forEach(async pub => { //public meetings location
            const [error, response] = await to(Geocode.fromAddress(pub.address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(isolated.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const shofarBlowerInfo = db.shofarlowers.find((shofarBlower) => shofarBlower.id === pub.shofarBlowerId);
                let newLocObj = {
                    type: SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    info: <div id="info-window-container">
                        <div className="info-window-header">תקיעה ציבורית</div>
                        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{shofarBlowerInfo.name}</div></div>
                        <div id="pub-address-container"><img src={'/icons/address.svg'} /><div>{pub.address}</div></div>
                        <div id="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{pub.startTime}</div></div>
                        <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
                        <div className="notes">יש להצטרף לתקיעה על מנת להתעדכן</div>
                        <div id="join-button">הצטרף לתקיעה</div>
                    </div>
                };
                setAllLocations(allLocations => Array.isArray(allLocations) ? [...allLocations, newLocObj] : [newLocObj])
            } catch (e) { console.log("cought Geocode.fromAddress(pub.address)==", pub.address, " : ", e); return; }
        });
    }

    const setSBMapContent = async () => {
        //open requests
        db.isolateds.forEach(async isolated => { // isolated location (private meetings)
            let [error, response] = await to(Geocode.fromAddress(isolated.address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(isolated.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const shofarBlowerName = db.shofarlowers.find((shofarBlower) => shofarBlower.id === isolated.shofarBlowerId).name;
                const newLocObj = {
                    type: ISOLATED,
                    location: { lat, lng },
                    info: <div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
                        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{shofarBlowerName}</div></div>
                        <div>לא ניתן להצטרף לתקיעה זו</div></div>
                }
                setAllLocations(allLocations => Array.isArray(allLocations) ? allLocations.push(newLocObj) : [newLocObj])
            } catch (e) { console.log("err setPublicMapContent, ", e); }
        });

        db.pubSHofarBlowing.forEach(async pub => { //public meetings location
            const [error, response] = await to(Geocode.fromAddress(pub.address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(isolated.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const shofarBlowerInfo = db.shofarlowers.find((shofarBlower) => shofarBlower.id === pub.shofarBlowerId);
                let newLocObj = {
                    type: SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    info: <div id="info-window-container">
                        <div className="info-window-header">תקיעה ציבורית</div>
                        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{shofarBlowerInfo.name}</div></div>
                        <div id="pub-address-container"><img src={'/icons/address.svg'} /><div>{pub.address}</div></div>
                        <div id="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{pub.startTime}</div></div>
                        <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
                        <div className="notes">יש להצטרף לתקיעה על מנת להתעדכן</div>
                        <div id="join-button">הצטרף לתקיעה</div>
                    </div>
                };
                setAllLocations(allLocations => Array.isArray(allLocations) ? allLocations.push(newLocObj) : [newLocObj]);
            } catch (e) { console.log("cought Geocode.fromAddress(pub.address)==", pub.address, " : ", e); return; }
        });
    }

    return (
        <div id="map-contaoner">
            <MyMapComponent
                changeCenter={setCenter}
                allLocations={allLocations}
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}
                isMarkerShown={isMarkerShown}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<img src='/icons/loader.svg' />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    );
}

export default MapComp;




const MyMapComponent = withScriptjs(withGoogleMap((props) => {

    return <GoogleMap
        defaultZoom={20}
        defaultOptions={mapOptions}
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
    const searchBoxRef = useRef()

    const handlePlacesChange = () => {
        let places = searchBoxRef.current.getPlaces();
        console.log('places: ', places);
        const bounds = new window.google.maps.LatLngBounds();
        // console.log(bounds, '1');
        places.forEach(place => {
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport)
            } else {
                bounds.extend(place.geometry.location)
            }
        });
        console.log(bounds, '2');


        const nextMarkers = places.map(place => ({
            position: place.geometry.location,
        }));
        const nextCenter = _.get(nextMarkers, '0.position', props.center);
        props.changeCenter(nextCenter);
        // this.SearchBoxRef.current.map.fitBounds(bounds);
    }



    return (
        <SearchBox
            strictBounds={true}
            ref={searchBoxRef}
            controlPosition={window.google.maps.ControlPosition.TOP_CENTER}
            onPlacesChanged={handlePlacesChange}
        >
            <div id="search-input-container">
                <input
                    id="search-input"
                    type="text"
                    placeholder="חיפוש"
                />
                <img id="search-icon" src="/icons/search.svg" />
            </div>
        </SearchBox>
    );
}


const MarkerGenerator = (props) => {

    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const closeOrOpenInfoWindow = () => {
        setIsInfoWindowOpen(isInfoWindowOpen => !isInfoWindowOpen);
    }

    const { info, location, type } = props.locationInfo;


    return (
        <Marker
            icon={type === ISOLATED ? '/icons/single-blue.svg' : '/icons/group-orange.svg'}
            onClick={closeOrOpenInfoWindow}
            position={{ lat: location.lat, lng: location.lng }}>
            {isInfoWindowOpen && <InfoWindow onCloseClick={closeOrOpenInfoWindow}>{info}</InfoWindow>}
        </Marker>
    );
}