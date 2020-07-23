import React, { useEffect, useState, useRef } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";

import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import Geocode from "react-geocode";
import _ from "lodash";
import './map.scss';
import MyMapDirectionsRenderer from './sb_map_directions_renderer';
import MarkerGenerator from './marker_generator';
import { useContext } from 'react';
import { SBContext } from '../../ctx/shofar_blower_context';

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

    const { openGenAlert,
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs } = useContext(SBContext)

    const [reqsLocs, setReqsLocs] = useState(null);
    const [myMLocs, setMyMLocs] = useState(null)

    const [center, setCenter] = useState({});
    const [isMarkerShown, setIsMarkerShown] = useState(false);

    const uName = userData && typeof userData === "object" && userData.name ? userData.name : ''

    const privateLocInfo = (iName, address, assign = false) => (<div id="info-window-container"><div className="info-window-header">{assign ? "מחפש/ת תקיעה פרטית" : "תקיעה פרטית"}</div>
        {iName ? <div id="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{iName}</div></div> : null}
        {address ? <div id="pub-shofar-blower-name-container"><img src={'/icons/address.svg'} /><div>{address}</div></div> : null}
        {assign ? <div id="join-button">שיבוץ</div> : null}</div>)

    const publicLocInfo = (address, start_time, assign = false, comments = '') => (<div id="info-window-container">
        <div className="info-window-header">{assign ? "מחפש/ת תקיעה ציבורית" : "תקיעה ציבורית"}</div>
        <div id="pub-address-container"><img src={'/icons/address.svg'} /><div>{address}</div></div>
        <div>{comments}</div>
        {assign ? <div id="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{start_time}</div></div> : null}
        <div className="notes">ייתכנו שינויי בזמני התקיעות</div>
        {assign ? <div id="join-button">שיבוץ</div> : null}
    </div>)


    useEffect(() => {
        (async () => {
            if (userData && typeof userData === "object" && !Array.isArray(userData)) {
                Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
                Geocode.setLanguage("he");
                const centerAdr = (userData && typeof userData === "object" && userData.name) ? `${userData.city || ""} ${userData.street || ""} ${userData.appartment || ""}` : "רעננה"
                let [error, res] = await to(Geocode.fromAddress(centerAdr))
                if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
                try {
                    const newCenter = res.results[0].geometry.location;
                    if (newCenter !== center) setCenter(newCenter)
                } catch (e) { console.log(`ERROR getting ${centerAdr} geoCode, res.results[0].geometry.location `, e); }
            }
        })();
    }, [userData])

    useEffect(() => {
        if (meetingsReqs && Array.isArray(meetingsReqs) && meetingsReqs.length
            && (!reqsLocs || (Array.isArray(reqsLocs) && !reqsLocs.length))) {
            setOpenReqsContent(meetingsReqs)
            console.log('meetingsReqs: ', meetingsReqs);
        }
    }, [meetingsReqs])
    useEffect(() => {
        //if dont have data in myLocs, but have data in myMeetings and in userData
        if (
            myMeetings && Array.isArray(myMeetings) && myMeetings.length
            && (userData && typeof userData === "object" && userData.name)
            && (!myMLocs || (Array.isArray(myMLocs) && !myMLocs.length))
        ) {
            setMyMeetingsContent(myMeetings, userData)
            console.log('myMeetings: ', myMeetings);
        }
    }, [myMeetings, userData])


    const setOpenReqsContent = async (reqsArr) => {
        if (!reqsArr || !Array.isArray(reqsArr) || !reqsArr.length) { setReqsLocs([]); }
        //open requests meetings
        let newReqsLocs = []
        let meetReq;
        for (let i = 0; i < reqsArr.length; i++) {
            meetReq = reqsArr[i]
            let privateMeet = !meetReq.isPublicMeeting
            const address = privateMeet ? `${meetReq.city} ${meetReq.street} ${meetReq.appartment}` : `${meetReq.city} ${meetReq.street}`
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
            Geocode.setLanguage("he");
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(privateMeet.address) for address ${address}: ${error}`); openGenAlert({ text: `קרתה שגיאה עם המיקום של הבקשה ב: ${address}` }); continue; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    type: privateMeet ? PRIVATE_MEETING : SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    info: privateMeet ? privateLocInfo(meetReq.name, address, true) : publicLocInfo(address, meetReq.startTime, true, meetReq.comments)
                }
                newReqsLocs.push(newLocObj)
            } catch (e) { console.log("err setSBMapContent, ", e); }
            if (i == reqsArr.length - 1) {
                console.log('newReqsLocs: ', newReqsLocs);
                setReqsLocs(newReqsLocs);
            }
        }
    }

    const setMyMeetingsContent = (meetings, userData) => {
        let meetingsLocs = []
        meetings = meetings.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime()) //?
        meetings.forEach(async (myMeeting, i, arr) => {
            const address = `${myMeeting.city} ${myMeeting.street}`;
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(privateMeet.address): ${error}`); openGenAlert({ text: `קרתה שגיאה עם המיקום של התקיעה שלך שב: ${address}` }); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    type: myMeeting.isPrivateMeeting ? PRIVATE_MEETING : SHOFAR_BLOWING_PUBLIC,
                    location: { lat, lng },
                    markerOptions: {
                        type: myMeeting.isPrivateMeeting ? PRIVATE_MEETING : SHOFAR_BLOWING_PUBLIC,
                        info: myMeeting.isPrivateMeeting ? privateLocInfo(myMeeting.name) : publicLocInfo(myMeeting.name, address, myMeeting.startTime),
                    }

                }
                meetingsLocs.push(newLocObj)
            } catch (e) { console.log("err setSBMapContent, ", e); }
            if (i === arr.length - 1) { //end of forEach
                setMyMLocs(meetingsLocs)
            }
        });
    }


    const addNewSBMeeting = (meetingInfo) => {

    }



    if (!reqsLocs && !myMLocs) return <div>LOADING...</div>;
    return (
        <div id="map-container">
            <MyMapComponent
                changeCenter={setCenter}
                reqsLocs={reqsLocs}
                myMeetingsLocs={myMLocs}
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}
                userLocation
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
        url: '/icons/sb_origin.svg',
        scaledSize: new window.google.maps.Size(100, 100),
        // origin: new window.google.maps.Point(0, 0),
        // anchor: new window.google.maps.Point(0, 0),
        // labelOrigin: new window.google.maps.Point(0, 60),
    }
    const userLocationLabel = { text: 'אתה יוצא מכאן', color: "darkblue", fontWeight: "bold" }
    const userOrigin = props.userLocation ? { location: props.center, icon: userLocationIcon } : null;
    return (
        <GoogleMap
            defaultZoom={16} //! change back to 20
            defaultOptions={mapOptions}
            // bounds={31.4117257, 35.0818155}
            center={props.center}
        >
            <SearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />
            {/* {props.userLocation && <MarkerGenerator position={props.center} label={{ text: 'אתה נמצא כאן', color: "black", fontWeight: "bold" }} icon={userLocationIcon} />} my location */}
            {props.reqsLocs && Array.isArray(props.reqsLocs) && props.reqsLocs.map((locationInfo, index) => {
                return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
            })}
            {Array.isArray(props.myMeetingsLocs) && props.myMeetingsLocs.length &&
                <MyMapDirectionsRenderer places={[...props.myMeetingsLocs, userOrigin]} />}
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

