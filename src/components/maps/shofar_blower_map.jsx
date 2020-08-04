import React, { useEffect, useState, useContext } from 'react';

import { SBContext } from '../../ctx/shofar_blower_context';
import { MainContext } from '../../ctx/MainContext';

import { SBMapComponent } from './sb_map_renderer'

import { dateWTimeFormatChange } from '../../fetch_and_utils';
import { isBrowser } from "react-device-detect";



const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';




const ShofarBlowerMap = (props) => {

    const { openGenAlert } = useContext(MainContext)

    const {
        myMeetings, meetingsReqs,
        setAssignMeetingInfo,
        startTimes } = useContext(SBContext)

    const { userInfo: userData } = useContext(MainContext)


    const [reqsLocs, setReqsLocs] = useState(null); //keep null
    const [myMLocs, setMyMLocs] = useState(null); //keep null
    const [routeCoordinates, setRouteCoordinates] = useState(null)
    const [userOriginLoc, setUserOriginLoc] = useState(null)

    const [allMapData, setAllMapData] = useState(null)
    const [err, setErr] = useState(false)

    const [center, setCenter] = useState({});

    const uName = userData && typeof userData === "object" && userData.name ? userData.name : ''


    const privateLocInfo = (meetingData, assign = false) => (<div id="info-window-container"><div className="info-window-header">{assign ? "מחפש/ת תקיעה פרטית" : "תקיעה פרטית שלי"}</div>
        {meetingData && meetingData.name && assign ? <div className="pub-shofar-blower-name-container">{meetingData.name}</div> : (meetingData && meetingData.name ? <div className="pub-shofar-blower-name-container"><img alt="" src={'/icons/shofar.svg'} /><div>{meetingData.name}</div></div> : null)}
        {meetingData && meetingData.address ? <div className="pub-address-container">{meetingData.address}</div> : null}
        <div className="pub-start-time-container"><img alt=""src={'/icons/clock.svg'} /><div>{meetingData && meetingData.startTime ? dateWTimeFormatChange(meetingData.startTime).join(" ") : "---"}</div></div>
        {meetingData && meetingData.comments ? <div className="pub-address-container" >{meetingData.comments}</div> : null}
        {assign ? <div className="join-button" onClick={() => { handleAssign(meetingData) }} >שיבוץ</div> : null}</div>)

    const publicLocInfo = (meetingData, assign = false) => (<div id="info-window-container">
        <div className="info-window-header">{assign ? "מחפש/ת תקיעה ציבורית" : "תקיעה ציבורית שלי"}</div>
        {meetingData && meetingData.address ? <div className="pub-address-container"><img alt=""src={'/icons/address.svg'} /><div>{meetingData.address}</div></div> : null}
        {meetingData && meetingData.comments ? <div>{meetingData.comments}</div> : null}
        <div className="pub-start-time-container"><img alt=""src={'/icons/clock.svg'} /><div>{meetingData && meetingData.startTime ? dateWTimeFormatChange(meetingData.startTime).join(" ") : "---"}</div></div>
        {assign ? null : <div className="notes">ייתכנו שינויי בזמני התקיעות</div>}
        {assign ? <div className="join-button" onClick={() => { handleAssign(meetingData) }} >שיבוץ</div> : null}
    </div>)


    useEffect(() => {
        (async () => {
            if (userData && typeof userData === "object" && !Array.isArray(userData)) {
                const newCenter = { lat: userData.lat, lng: userData.lng };
                if (newCenter !== center) setCenter(newCenter)
                setUserOriginLoc(newCenter)
            }
        })();
    }, [userData])

    useEffect(() => {
        if (userOriginLoc && typeof userOriginLoc === "object") {
            if (meetingsReqs && Array.isArray(meetingsReqs)) {
                meetingsReqs.length ? setOpenReqsContent(meetingsReqs) : setReqsLocs([])
            }
        }
    }, [userOriginLoc])

    useEffect(() => {
        if (reqsLocs && Array.isArray(reqsLocs)) {
            if (myMeetings && Array.isArray(myMeetings)) {
                myMeetings.length ? setMyMeetingsContent(myMeetings) : setMyMLocs([])
            }
        }
    }, [reqsLocs])


    useEffect(() => {
        if (Array.isArray(myMLocs) && Array.isArray(reqsLocs) && userOriginLoc && typeof userOriginLoc === "object" && userData && typeof userData === "object") {
            setAllMapData({ userData, userOriginLoc, reqsLocs, myMLocs })
        }
    }, [myMLocs])


    useEffect(() => {
        // console.log("changed myMeetings");
        if (Array.isArray(myMLocs) && Array.isArray(reqsLocs) && userOriginLoc && typeof userOriginLoc === "object" && userData && typeof userData === "object") {
            setMyMeetingsContent(myMeetings)
        }
    }, [myMeetings])

    useEffect(() => {
        if (Array.isArray(myMLocs) && Array.isArray(reqsLocs) && userOriginLoc && typeof userOriginLoc === "object" && userData && typeof userData === "object") {
            setOpenReqsContent(meetingsReqs)
        }
    }, [meetingsReqs])



    const setOpenReqsContent = async (reqsArr) => {
        if (!Array.isArray(reqsArr) || !reqsArr.length) { setReqsLocs([]); }
        //open requests meetings
        let newReqsLocs = []
        let meetReq;
        for (let i in reqsArr) {
            meetReq = reqsArr[i]
            const newLocObj = {
                type: meetReq.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING,
                location: { lat: meetReq.lat, lng: meetReq.lng },
                info: meetReq.isPublicMeeting ? publicLocInfo(meetReq, true) : privateLocInfo(meetReq, true)
            }
            newReqsLocs.push(newLocObj)
            if (i == reqsArr.length - 1) {
                setReqsLocs(newReqsLocs);
            }
        }
    }

    const setMyMeetingsContent = async (meetings) => {
        let meetingsLocs = []
        let myMeeting;
        for (let i in meetings) {
            myMeeting = meetings[i]
            let myStartT = Array.isArray(startTimes) && startTimes.find(st => st.meetingId == myMeeting.meetingId)
            try {
                const newLocObj = {
                    type: myMeeting.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING,
                    location: { lat: myMeeting.lat, lng: myMeeting.lng },
                    startTime: myStartT && myStartT.startTime ? myStartT.startTime : myMeeting.startTime,
                    meetingId: myMeeting.meetingId,
                    constMeeting: myMeeting.constMeeting,
                    info: myMeeting.isPublicMeeting ? publicLocInfo(myMeeting, false) : privateLocInfo(myMeeting, false),
                }
                meetingsLocs.push(newLocObj)
            } catch (e) { console.log("err setSBMapContent, ", e); }
            if (i == meetings.length - 1) { //end of forEach
                setMyMLocs(meetingsLocs);
            }
        } //end for 
    }




    const handleAssign = (meetingInfo) => {
        setAssignMeetingInfo(meetingInfo)
    }



    return (
        <div className={`map-container ${isBrowser ? "sb-map-container" : "sb-map-container-mobile"}`} id="sb-map-container">
\
            <SBMapComponent
                changeCenter={setCenter}
                center={Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}

                err={err}
                data={allMapData}
                history={props.history}

                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<img alt=""className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />

        </div>
    );
}

export default ShofarBlowerMap;