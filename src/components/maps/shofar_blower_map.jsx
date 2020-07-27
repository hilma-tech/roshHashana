import React, { useEffect, useState, useRef, useContext } from 'react';
import { SBContext } from '../../ctx/shofar_blower_context';

import Geocode from "react-geocode";
import _ from "lodash";
// import MyMapDirectionsRenderer from './sb_map_directions_renderer';
import MarkerGenerator from './marker_generator';
import { dateWTimeFormatChange } from '../../fetch_and_utils';
import { MyMapComponent } from './sb_map_directions_renderer'

const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))

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
    const [routeCoordinates, setRouteCoordinates] = useState(null)
    const [userOriginLoc, setUserOriginLoc] = useState(null)

    const [allMapData, setAllMapData] = useState(null)

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
        console.log('useEffect userData ');
        (async () => {
            if (userData && typeof userData === "object" && !Array.isArray(userData)) {
                Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
                Geocode.setLanguage("he");
                const centerAdr = `${userData.city || ""} ${userData.street || ""} ${userData.appartment || ""}`
                let [error, res] = await to(Geocode.fromAddress(centerAdr))
                if (error || !res) { console.log("error getting geoCode of ירושלים: ", error); return; }
                try {
                    const newCenter = res.results[0].geometry.location;
                    if (newCenter !== center) setCenter(newCenter)
                    setUserOriginLoc(newCenter)
                } catch (e) { console.log(`ERROR getting ${centerAdr} geoCode, res.results[0].geometry.location `, e); }
            }
        })();
    }, [userData])

    useEffect(() => {
        console.log('useEffect userOriginLoc ');
        if (userOriginLoc && typeof userOriginLoc === "object") {
            if (meetingsReqs && Array.isArray(meetingsReqs)) {
                setOpenReqsContent(meetingsReqs)
            }
        }
    }, [userOriginLoc])

    useEffect(() => {
        console.log('useEffect reqsLocs ');
        if (reqsLocs && Array.isArray(reqsLocs)) {
            if (myMeetings && Array.isArray(myMeetings)) {
                setMyMeetingsContent(myMeetings)
            }
        }
    }, [reqsLocs])


    useEffect(() => {
        console.log('useEffect myMLocs ');
        if (Array.isArray(myMLocs) && Array.isArray(reqsLocs) && userOriginLoc && typeof userOriginLoc === "object" && userData && typeof userData === "object") {
            setAllMapData({ userData, userOriginLoc, reqsLocs, myMLocs })
            console.log('<< myMLocs: ', myMLocs);
        }
    }, [myMLocs])



    const setOpenReqsContent = async (reqsArr) => {
        if (!reqsArr || !Array.isArray(reqsArr) || !reqsArr.length) { setReqsLocs([]); }
        //open requests meetings
        let newReqsLocs = []
        let meetReq;
        for (let i = 0; i < reqsArr.length; i++) {
            meetReq = reqsArr[i]
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
                setReqsLocs(newReqsLocs);
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
                setMyMLocs(meetingsLocs);
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
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}

                // reqsLocs={reqsLocs}
                // myMeetingsLocs={myMLocs}
                // userOriginLoc={userOriginLoc}
                // userData={userData}

                data={allMapData}

                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<img src='/icons/loader.svg' />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    );
}

export default ShofarBlowerMap;