import React, { useEffect, useState, useRef, useContext } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";
import { SBContext } from '../../ctx/shofar_blower_context';

import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import Geocode from "react-geocode";
import _ from "lodash";
import MyMapDirectionsRenderer from './sb_map_directions_renderer';
import MarkerGenerator from './marker_generator';
import { dateWTimeFormatChange } from '../../fetch_and_utils';


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
        setUserData, setMyMeetings, setMeetingsReqs,
        setAssignMeetingInfo } = useContext(SBContext)

    const [reqsLocs, setReqsLocs] = useState(null);
    const [myMLocs, setMyMLocs] = useState(null)

    const [center, setCenter] = useState({});
    const [isMarkerShown, setIsMarkerShown] = useState(false);

    const uName = userData && typeof userData === "object" && userData.name ? userData.name : ''


    const privateLocInfo = (meetingData, assign = false) => (<div id="info-window-container"><div className="info-window-header">{assign ? "מחפש/ת תקיעה פרטית" : "תקיעה פרטית"}</div>
        {/* iName, address, comments, startTime, meetingId */}
        {meetingData && meetingData.name && assign ? <div className="pub-shofar-blower-name-container">{meetingData.name}</div> : (meetingData && meetingData.name ? <div className="pub-shofar-blower-name-container"><img src={'/icons/shofar.svg'} /><div>{meetingData.name}</div></div> : null)}
        {meetingData && meetingData.address && assign ? <div className="pub-address-container">{meetingData.address}</div> : (meetingData && meetingData.address ? <div className="pub-shofar-blower-name-container"><img src={'/icons/address.svg'} /><div>{meetingData.address}</div></div> : null)}
        {meetingData && meetingData.startTime ? <div className="pub-address-container">{dateWTimeFormatChange(meetingData.startTime).join(" ")}</div> : null}
        {meetingData && meetingData.comments ? <div>{meetingData.comments}</div> : null}
        {assign ? <div className="join-button" onClick={() => { handleAssign(meetingData) }} >שיבוץ</div> : null}</div>)

    const publicLocInfo = (meetingData, assign = false) => (<div id="info-window-container">
        <div className="info-window-header">{assign ? "מחפש/ת תקיעה ציבורית" : "תקיעה ציבורית"}</div>
        {meetingData && meetingData.address ? <div className="pub-address-container"><img src={'/icons/address.svg'} /><div>{meetingData.address}</div></div> : null}
        {meetingData && meetingData.startTime ? <div className="pub-address-container">{meetingData.startTime}</div> : null}
        {assign ? <div className="pub-start-time-container"><img src={'/icons/clock.svg'} /><div>{meetingData && meetingData.startTime ? dateWTimeFormatChange(meetingData.startTime).join(" ") : "---"}</div></div> : null}
        {assign ? null : <div className="notes">ייתכנו שינויי בזמני התקיעות</div>}
        {assign ? <div className="join-button" onClick={() => { handleAssign(meetingData) }} >שיבוץ</div> : null}
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
        if (meetingsReqs && Array.isArray(meetingsReqs)) {
            setOpenReqsContent(meetingsReqs)
        }
    }, [meetingsReqs])
    useEffect(() => {
        if (
            myMeetings && Array.isArray(myMeetings) && myMeetings.length
            && (userData && typeof userData === "object" && userData.name)) {
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
            console.log('meetReq: ', meetReq);
            const address = meetReq.isPublicMeeting ? `${meetReq.city} ${meetReq.street}` : `${meetReq.city} ${meetReq.street} ${meetReq.appartment}`
            meetReq.address = address;
            Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
            Geocode.setLanguage("he");
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(privateMeet.address) for address ${address}: ${error}`); openGenAlert({ text: `קרתה שגיאה עם המיקום של הבקשה ב: ${address}` }); continue; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    type: meetReq.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING,
                    location: { lat, lng },
                    info: meetReq.isPublicMeeting ? publicLocInfo(meetReq, true) : privateLocInfo(meetReq, true)
                }
                newReqsLocs.push(newLocObj)
            } catch (e) { console.log("err setSBMapContent, ", e); }
            if (i == reqsArr.length - 1) {
                console.log('newReqsLocs: ', newReqsLocs);
                setReqsLocs(newReqsLocs);
                console.log('newReqsLocs: ', newReqsLocs);
            }
        }
    }

    const setMyMeetingsContent = (meetings) => {
        let meetingsLocs = []
        meetings = meetings.sort((a, b) => new Date(a.startTime).getTime() > new Date(b.startTime).getTime()) //?
        meetings.forEach(async (myMeeting, i, arr) => {
            const address = `${myMeeting.city} ${myMeeting.street}`;
            myMeeting.address = address;
            let [error, response] = await to(Geocode.fromAddress(address))
            if (error || !response || !Array.isArray(response.results) || response.status !== "OK") { console.log(`error geoCode.fromAddress(meetReq.isPublicMeeting.address): ${error}`); openGenAlert({ text: `קרתה שגיאה עם המיקום של התקיעה שלך שב: ${address}` }); return; }
            try {
                const { lat, lng } = response.results[0].geometry.location;
                const newLocObj = {
                    type: myMeeting.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING,
                    location: { lat, lng },
                    startTime: myMeeting.startTime,
                    meetingId: myMeeting.meetingId,
                    markerOptions: {
                        type: myMeeting.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING,
                        info: myMeeting.isPublicMeeting ? publicLocInfo(myMeeting, false) : privateLocInfo(myMeeting, false),
                    }
                }
                meetingsLocs.push(newLocObj)
            } catch (e) { console.log("err setSBMapContent, ", e); }
            if (i === arr.length - 1) { //end of forEach
                setMyMLocs(meetingsLocs)
                console.log('meetingsLocs: ', meetingsLocs);
            }
        });
    }


    const handleAssign = (meetingInfo) => {
        console.log('meetingInfo: ', meetingInfo);
        setAssignMeetingInfo(meetingInfo)
    }


    return (
        <div id="map-container">
            <MyMapComponent
                changeCenter={setCenter}
                reqsLocs={reqsLocs}
                myMeetingsLocs={myMLocs}
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}
                userLocation
                userData={userData}
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
    const userOrigin = props.userLocation ? { location: props.center, icon: userLocationIcon, origin: true } : null;
    return (
        <GoogleMap
            defaultZoom={16} //! change back to 20
            defaultOptions={mapOptions}
            // bounds={31.4117257, 35.0818155}
            center={props.center}
        >
            <SearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />
            {props.reqsLocs && Array.isArray(props.reqsLocs) && props.reqsLocs.map((locationInfo, index) => {
                return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
            })}
            {
                Array.isArray(props.myMeetingsLocs) ?
                    <MyMapDirectionsRenderer places={[userOrigin, ...props.myMeetingsLocs]} /> // origin muse be first
                    : <MarkerGenerator position={props.center} icon={userLocationIcon} /> /* my location */
            }
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

