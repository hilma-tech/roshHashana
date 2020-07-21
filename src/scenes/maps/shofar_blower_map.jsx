import React, { useEffect, useState, useRef } from 'react';

import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";

import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import Geocode from "react-geocode";
import db from '../db.json'
import _ from "lodash";
import Auth from '../../modules/auth/Auth';
import './map.scss';
import MyMapDirectionsRenderer from './sb_map_directions_renderer';
import MarkerGenerator from './marker_generator';

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
const PRIVATE_MEETING = 'private meeting';

const ShofarBlowerMap = (props) => {

    const [reqsLocs, setReqsLocs] = useState(null);
    // window.reqsLocs = reqsLocs;
    const [sbLocs, setSBLocs] = useState(null)
    const [center, setCenter] = useState({});
    const [isMarkerShown, setIsMarkerShown] = useState(false);
    const [meetingsReqs, setMeetingsReqs] = useState(null);
    const [myMeetings, setMyMeetings] = useState(null);

    const privateLocInfo = (name) => (<div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{name}</div></div>
        <div>לא ניתן להצטרף לתקיעה זו</div></div>)

    const publicLocInfo = (name, address, start_time) => (<div id="info-window-container">
        <div className="info-window-header">תקיעה ציבורית</div>
        <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{name}</div></div>
        <div id="pub-address-container"><img src={'/icons/address.svg'} /><div>{address}</div></div>
        <div id="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{start_time}</div></div>
        <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
        <div className="notes">יש להצטרף לתקיעה על מנת להתעדכן</div>
        <div id="join-button">הצטרף לתקיעה</div>
    </div>)

    useEffect(() => {
        (async () => {
            let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/openSBRequests`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" }
            }, true);
            if (mapContent && mapContent.openReqs && !meetingsReqs) {
                setMeetingsReqs(mapContent.openReqs);
                setOpenReqsContent(mapContent.openReqs)
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
            // Array.isArray(meetingsReqs) && ;
            Geocode.setLanguage("he");
            let [error, res] = await to(Geocode.fromAddress("רעננה"))
            if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
            try {
                const newCenter = res.results[0].geometry.location;
                if (newCenter !== center) setCenter(newCenter)
            } catch (e) { console.log(`ERROR getting ירושלים geoCode, res.results[0].geometry.location `, e); }
        })();
    }, [meetingsReqs])


    const setOpenReqsContent = async (reqsArr) => {
        if (!reqsArr || !Array.isArray(reqsArr) || !reqsArr.length) { setReqsLocs([]); return; } //!
        //open requests meetings
        // isolated location (private meetings)
        let newReqsLocs = []
        let meetReq;
        for (let i = 0; i < reqsArr.length; i++) {
            meetReq = reqsArr[i]
            let privateMeet = !meetReq.isPublicMeeting
            const address = privateMeet ? `${meetReq.isolatedCity} ${meetReq.isolatedStreet} ${meetReq.isolatedAppartment}` : `${meetReq.publicMeetingCity} ${meetReq.publicMeetingStreet}`
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(privateMeet.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    type: privateMeet ? PRIVATE_MEETING : SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    info: privateMeet ? privateLocInfo(meetReq.isolatedName) : publicLocInfo(meetReq.sbName, address, meetReq.publicMeetingStartTime)
                }
                newReqsLocs.push(newLocObj)
                if (i == reqsArr.length - 1) {
                    setReqsLocs(newReqsLocs);
                    // console.log('newReqsLocs: ', newReqsLocs);
                }
            } catch (e) { console.log("err setSBMapContent, ", e); }
        }
    }

    const setMyMeetingsContent = (meetings)=>{
        // setSBLocs(db.mySBRoute)
        let newSBLocs = []
        db.mySBRoute.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime()).forEach(async (myMeeting, i, arr) => {
            const address = myMeeting.address;
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(privateMeet.address): ${error}`); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    // type: myMeeting.isPrivateMeeting ? PRIVATE_MEETING : SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    markerOptions: {
                        type: myMeeting.isPrivateMeeting ? PRIVATE_MEETING : SHOFAR_BLOWING_PUBLIC,
                        info: myMeeting.isPrivateMeeting ? privateLocInfo(myMeeting.isolatedName) : publicLocInfo(myMeeting.isolatedName, address, myMeeting.startTime),
                    }

                }
                newSBLocs.push(newLocObj)
            } catch (e) { console.log("err setSBMapContent, ", e); }
            if (i === arr.length - 1) { //end of forEach
                // console.log('newSBLocs: ', newSBLocs);
                setSBLocs(newSBLocs)
            }
        });
    }


    const addNewSBMeeting = (meetingInfo) => {
        
    }



    if (!reqsLocs && !sbLocs) return <div>LOADING...</div>;
    return (
        <div id="map-container">
            <MyMapComponent
                changeCenter={setCenter}
                reqsLocs={reqsLocs}
                sbLocs={sbLocs}
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

export default ShofarBlowerMap;


//!MAP START
const MyMapComponent = withScriptjs(withGoogleMap((props) => {
    const userLocationIcon = {
        url: '/icons/selfLocation.svg',
        scaledSize: new window.google.maps.Size(50, 50),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(0, 0),
        labelOrigin: new window.google.maps.Point(0, 60)
    }

    return (
        <GoogleMap
            defaultZoom={16} //! change back to 20
            defaultOptions={mapOptions}
            // bounds={31.4117257, 35.0818155}
            center={props.center}
        >
            <SearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />
            {props.userLocation && <MarkerGenerator position={props.center} label={{ text: 'אתה נמצא כאן', color: "black", fontWeight: "bold" }} icon={userLocationIcon} />} {/* my location */}
            {props.reqsLocs && Array.isArray(props.reqsLocs) && props.reqsLocs.map((locationInfo, index) => {
                return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
            })}
            {Array.isArray(props.sbLocs) && props.sbLocs.length &&
                <MyMapDirectionsRenderer places={props.sbLocs} />}
        </GoogleMap>
    );
}));
//!MAP END


const SearchBoxGenerator = (props) => {
    const searchBoxRef = useRef()

    const handlePlacesChange = () => {
        let places = searchBoxRef.current.getPlaces();
        // console.log('places: ', places);
        const bounds = new window.google.maps.LatLngBounds();
        // console.log(bounds, '1');
        places.forEach(place => {
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport)
            } else {
                bounds.extend(place.geometry.location)
            }
        });
        // console.log(bounds, '2');


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

