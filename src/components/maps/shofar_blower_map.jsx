import React, { useEffect, useState, useContext } from 'react';
import Geocode from "react-geocode";

import moment from 'moment'
import Auth from '../../modules/auth/Auth'

import { SBContext } from '../../ctx/shofar_blower_context';
import { MainContext } from '../../ctx/MainContext';

import { SBMapComponent } from './sb_map_renderer'

import { splitJoinAddressOnIsrael, checkDateBlock } from '../../fetch_and_utils';
import { isBrowser } from "react-device-detect";
import { AdminMainContext } from '../../scenes/admin/ctx/AdminMainContext';
import { logE } from '../../handlers/consoleLogHandler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const to = promise => (promise.then(data => ([null, data])).catch(err => ([err])))

const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';




const ShofarBlowerMap = (props) => {
    let isAdmin = props.admin

    const { openGenAlert } = useContext(MainContext)
    const adminctx = useContext(AdminMainContext)
    const sbctx = useContext(SBContext)
    let userData,
        myMeetings, meetingsReqs,
        genMapMeetings, setGenMapMeetings,
        setAssignMeetingInfo,
        startTimes,
        setIsInRoute,
        isPrint
    let meetingsOfSelectedSB, setMeetingsOfSelectedSB

    if (sbctx && typeof sbctx === "object") {
        userData = sbctx.userData;
        myMeetings = sbctx.myMeetings;
        meetingsReqs = sbctx.meetingsReqs;
        genMapMeetings = sbctx.genMapMeetings;
        setGenMapMeetings = sbctx.setGenMapMeetings;
        setAssignMeetingInfo = sbctx.setAssignMeetingInfo;
        startTimes = sbctx.startTimes;
        setIsInRoute = sbctx.setIsInRoute;
        isPrint = sbctx.isPrint;
    }
    if (isAdmin && adminctx) {
        startTimes = adminctx.startTimes;
        meetingsOfSelectedSB = adminctx.meetingsOfSelectedSB;
    }


    const [center, setCenter] = useState({});
    const [backToCenterBtn, setBackToCenterBtn] = useState(false);

    const [userOriginLoc, setUserOriginLoc] = useState(null)
    const [allGenLocations, setAllGenLocations] = useState(null)

    const [allMapData, setAllMapData] = useState(null)
    const [err, setErr] = useState(false)

    const disableEdit = checkDateBlock('DATE_TO_BLOCK_BLOWER');


    const privateLocInfo = (meetingData, assign = false) => (<div id="info-window-container"><div className="info-window-header">{isAdmin ? (assign ? "מחפש" : "תקיעה פרטית") : (assign ? "מחפש/ת תקיעה פרטית" : "תקיעה פרטית שלי")}</div>
        {(meetingData && meetingData.name ? <div className="pub-shofar-blower-name-container"><div className="pub-shofar-blower-name" >{meetingData.name}</div></div> : null)}
        {meetingData && meetingData.address ? <div className="pub-address-container"><img alt="" src={'/icons/address.svg'} /><div>{splitJoinAddressOnIsrael(meetingData.address)}</div></div> : null}
        <div className="pub-start-time-container"><img alt="" src={'/icons/clock.svg'} /><div>{meetingData && meetingData.startTime ? `${new Date(meetingData.startTime).toLocaleDateString("en-US")} ${new Date(meetingData.startTime).getHours().toString().padStart(2, 0)}:${new Date(meetingData.startTime).getMinutes().toString().padStart(2, 0)}` : "---"}</div></div>
        {assign && !disableEdit ? <div className="join-button" onClick={() => { handleAssign(meetingData) }} >שיבוץ</div> : null}</div>)

    const publicLocInfo = (meetingData, assign = false) => (<div id="info-window-container">
        <div className="info-window-header">{isAdmin ? (assign ? "מחפש/ת תקיעה ציבורית" : "תקיעה ציבורית") : (assign ? "מחפש/ת תקיעה ציבורית" : "תקיעה ציבורית שלי")}</div>
        {meetingData && meetingData.address ? <div className="pub-address-container"><img alt="" src={'/icons/address.svg'} /><div>{splitJoinAddressOnIsrael(meetingData.address) + `${meetingData.comments ? ", " + meetingData.comments : ""}`}</div></div> : null}
        <div className="pub-start-time-container"><img alt="" src={'/icons/clock.svg'} /><div>{meetingData && meetingData.startTime ? `${new Date(meetingData.startTime).toLocaleDateString("en-US")} ${new Date(meetingData.startTime).getHours().toString().padStart(2, 0)}:${new Date(meetingData.startTime).getMinutes().toString().padStart(2, 0)}` : "---"}</div></div>
        {assign || isAdmin ? null : <div className="notes">ייתכנו שינויים בזמני התקיעות</div>}
        {assign && !disableEdit ? <div className="join-button" onClick={() => { handleAssign(meetingData) }} >שיבוץ</div> : null}
    </div>)


    useEffect(() => {
        (async () => {
            if (isAdmin) {
                // adminUseEffect()
                return;
            }
            if (userData && typeof userData === "object" && !Array.isArray(userData)) {
                let newCenter;
                let latNum = Number(userData.lat)
                let lngNum = Number(userData.lng)
                if (isNaN(latNum) || isNaN(lngNum)) {
                    // we don't have user's origin start point location (lng, lat) from db
                    if (typeof userData.address === "string") {
                        // but we have his address, so find lngLat
                        newCenter = await getLngLatOfLocation(userData.address)
                    }
                    else openGenAlert({ text: "קרתה בעיה באיתור מקום יציאתך" })
                }
                else {
                    newCenter = { lat: latNum, lng: lngNum };
                }
                if (newCenter !== center) setCenter(newCenter)
                setUserOriginLoc(newCenter)
            }
        })();
    }, [userData])
    useEffect(() => {
        adminUseEffect()
    }, [props.selectedSB, props.meetingsOfSelectedSB])

    const adminUseEffect = async () => {
        if (props.selectedSB && typeof props.selectedSB === "object" && props.selectedSB.id && props.meetingsOfSelectedSB) {
            let myRouteCnt = 0;
            const userStartTime = new Date(props.selectedSB.volunteering_start_time).getTime()
            const userEndTime = userStartTime + props.selectedSB.volunteering_max_time;
            let myStartT
            let meetingStartTime
            let isConstMeeting
            let locObj = {}
            let myMeetingsLocs = !Array.isArray(props.meetingsOfSelectedSB) ? []
                : props.meetingsOfSelectedSB.map((myMeeting) => {
                    myStartT = Array.isArray(startTimes) && startTimes.find(st => st.meetingId == myMeeting.meetingId)
                    meetingStartTime = new Date(myMeeting.startTime).getTime()
                    isConstMeeting = myMeeting.constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)
                    if (!isConstMeeting) { myRouteCnt++ }
                    locObj = {
                        location: { lat: myMeeting.lat, lng: myMeeting.lng },
                        startTime: (myStartT && myStartT.startTime) || myMeeting.startTime,
                        meetingId: myMeeting.meetingId,
                        isPublicMeeting: myMeeting.isPublicMeeting,
                        constMeeting: myMeeting.constMeeting,
                        info: myMeeting.isPublicMeeting ? publicLocInfo(myMeeting, false) : privateLocInfo(myMeeting, false)
                    }
                    isConstMeeting ?
                        locObj.iconType = myMeeting.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING
                        : locObj.iconUrl = `/icons/route_nums/route_${myRouteCnt}.svg`
                    return locObj;
                })

            let newCenter;
            let latNum = Number(props.selectedSB.lat)
            let lngNum = Number(props.selectedSB.lng)
            if (isNaN(latNum) || isNaN(lngNum)) {// we don't have user's origin start point location (lng, lat) from db
                if (typeof props.selectedSB.address === "string") {// but we have his address, so find lngLat
                    newCenter = await getLngLatOfLocation(props.selectedSB.address)
                }
                else openGenAlert({ text: "קרתה בעיה באיתור מקום יציאתך" })
            }
            else {
                newCenter = { lat: latNum, lng: lngNum };
            }
            if (newCenter !== center) setCenter(newCenter)
            //set selected isolator location

            let selectedIsolatorLoc = !props.selectedIsolator || typeof props.selectedIsolator !== "object" ? null :
                { ...props.selectedIsolator, location: { lat: props.selectedIsolator.lat, lng: props.selectedIsolator.lng }, meetingId: props.selectedIsolator.id, }

            // console.log('setAllMapData: ', { selectedIsolatorLoc, myMLocs: myMeetingsLocs, userOriginLoc: { lat: props.selectedSB.lat, lng: props.selectedSB.lng } });
            setAllMapData({ selectedIsolatorLoc, myMLocs: myMeetingsLocs, userOriginLoc: { lat: props.selectedSB.lat, lng: props.selectedSB.lng } })
        }
    }

    useEffect(() => {
        if (userOriginLoc && typeof userOriginLoc === "object") { //have userData and userOriginLoc, need location of reqs and route
            handleSetAllMapData();
        }
    }, [userOriginLoc])


    useEffect(() => {
        // when a meeting is added(/removed?) to my route (I assigned myself to one)
        // OR when a meeting request is added/removed to/from map (I assigned myself to one, socket.io: someone assigned him self to one)
        if (userData && typeof userData === "object" && !Array.isArray(userData) && userOriginLoc && typeof userOriginLoc === "object") {
            handleSetAllMapData()
        }
    }, [myMeetings, meetingsReqs])

    useEffect(() => {
        handleSetAllGenMapData(genMapMeetings)
    }, [genMapMeetings])


    const fetchAllGenLocations = async () => {
        let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/getMapData?isPubMap=${true}`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" }
        }, true);

        if (err) {
            openGenAlert({ text: "קרתה בעיה בהבאת המידע, נא נסו שנית מאוחר יותר" })
            return;
        }
        if (mapContent) {
            setGenMapMeetings(mapContent)
            handleSetAllGenMapData(mapContent)
        }
    }


    const handleSetAllMapData = () => {
        // layout for map renderer
        let meetingsReqsLocs = !Array.isArray(meetingsReqs) ? []
            : meetingsReqs.map(meetReq => {
                return {
                    iconType: meetReq.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING,
                    location: { lat: meetReq.lat, lng: meetReq.lng },
                    info: meetReq.isPublicMeeting ? publicLocInfo(meetReq, true) : privateLocInfo(meetReq, true)
                }
            })
        let myRouteCnt = 0;
        const userStartTime = new Date(userData.startTime).getTime()
        const userEndTime = userStartTime + userData.maxRouteDuration;
        let myStartT
        let meetingStartTime
        let isConstMeeting
        let locObj = {}
        let myMeetingsLocs = !Array.isArray(myMeetings) ? []
            : myMeetings.map((myMeeting, i) => {
                myStartT = Array.isArray(startTimes) && startTimes.find(st => st.meetingId == myMeeting.meetingId)
                meetingStartTime = new Date(myMeeting.startTime).getTime()
                isConstMeeting = myMeeting.constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)
                if (!isConstMeeting) { myRouteCnt++ }
                locObj = {
                    location: { lat: myMeeting.lat, lng: myMeeting.lng },
                    startTime: (myStartT && myStartT.startTime) || myMeeting.startTime,
                    meetingId: myMeeting.meetingId,
                    isPublicMeeting: myMeeting.isPublicMeeting,
                    constMeeting: myMeeting.constMeeting,
                    info: myMeeting.isPublicMeeting ? publicLocInfo(myMeeting, false) : privateLocInfo(myMeeting, false)
                }
                isConstMeeting ?
                    locObj.iconType = myMeeting.isPublicMeeting ? SHOFAR_BLOWING_PUBLIC : PRIVATE_MEETING :
                    locObj.iconUrl = `/icons/route_nums/route_${myRouteCnt}.svg`
                return locObj;
            })

        setAllMapData({ userData, userOriginLoc, reqsLocs: meetingsReqsLocs, myMLocs: myMeetingsLocs })
    }

    const handleSetAllGenMapData = (mapContent) => {
        if (!mapContent || !mapContent.privateMeetings) return;
        const priMeetLocs = []
        let privateMeet;
        for (let i in mapContent.privateMeetings) { // isolated location (private meetings)
            privateMeet = mapContent.privateMeetings[i]
            const lat = Number(privateMeet.lat), lng = Number(privateMeet.lng);
            priMeetLocs.push({
                type: PRIVATE_MEETING,
                location: { lat, lng },
                info: <div id="info-window-container"><div className="info-window-header">תקיעה פרטית</div>
                    <div className="pub-shofar-blower-name-container"><img alt="" src={'/icons/shofar.svg'} /><div>{privateMeet.blowerName}</div></div>
                </div>
            })
        }

        if (!mapContent || !mapContent.publicMeetings) return;
        const pubMeetLocs = []
        let pubMeet;
        let lat, lng, date
        for (let i in mapContent.publicMeetings) { // isolated location (private meetings)
            pubMeet = mapContent.publicMeetings[i]
            lat = Number(pubMeet.lat)
            lng = Number(pubMeet.lng);
            date = pubMeet.start_time ? moment(pubMeet.start_time).format("HH:mm") : 'לא נקבעה עדיין שעה';
            pubMeetLocs.push({
                type: SHOFAR_BLOWING_PUBLIC,
                location: { lat, lng },
                info: <div id="info-window-container">
                    <div className="info-window-header">תקיעה ציבורית</div>
                    <div className="pub-shofar-blower-name-container"><img alt="" src={'/icons/shofar.svg'} /><div>{pubMeet.blowerName}</div></div>
                    <div className="pub-address-container">
                        <img alt="" src={'/icons/address.svg'} />
                        <div style={{ textAlign: "right" }}>
                            {`${pubMeet.address} ${pubMeet.comments || pubMeet.commennts || ""}`}
                        </div>
                    </div>
                    <div className="pub-start-time-container"><img alt="" src={'/icons/clock.svg'} /><div>{date}</div></div>
                </div>
            })
        }
        setAllGenLocations({ priMeetLocs, pubMeetLocs })
    }


    const getLngLatOfLocation = async (address) => {
        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");
        let [error, res] = await to(Geocode.fromAddress(address));
        if (error || !res) { logE(`error getting geoCode of ${address}: `, error); return; }
        try {
            return res.results[0].geometry.location;
        } catch (e) { logE(`ERROR getting ${address} geoCode, res.results[0].geometry.location `, e); }
    }


    const handleAssign = (meetingInfo) => {
        setAssignMeetingInfo(meetingInfo);
        setIsInRoute(false)
    }

    const handleMapChanged = (needGenInfo) => {
        if (needGenInfo && !allGenLocations) {
            fetchAllGenLocations()
        }
    }


    return (
        <div className={`map-container ${isAdmin ? "sb-map-container-admin" : `${isBrowser ? "sb-map-container" : "sb-map-container-mobile"} ${isPrint ? 'print-map-style' : ''}`}`} id="sb-map-container">
            <SBMapComponent
                location={props.location}
                changeCenter={setCenter}
                center={center && typeof center === "object" && Object.keys(center).length ? center : { lat: 31.7767257, lng: 35.2346218 }}
                onCenterChanged={(s) => { setCenter(s); setBackToCenterBtn(true) }}

                err={err}
                isAdmin={isAdmin}
                handleForceAssign={isAdmin ? props.handleForceAssign : undefined}
                assigned={props.assigned}
                selectedSB={props.selectedSB}
                data={allMapData}
                history={props.history}
                allGenLocations={allGenLocations}
                handleMapChanged={handleMapChanged}
                setMeetingsOfSelectedSB={props.setMeetingsOfSelectedSB}
                showIsolators={props.showIsolators}
                isolators={props.isolators}

                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
            {backToCenterBtn && (!isAdmin || (isAdmin && props.selectedSB && props.selectedSB.lng && props.selectedSB.lat))
                ? <div className="center-map-btn-container"><FontAwesomeIcon icon="crosshairs" className="center-map-btn" onClick={() => { setBackToCenterBtn(false); setCenter(isAdmin && props.selectedSB && props.selectedSB.lng && props.selectedSB.lat ? { lat: Number(props.selectedSB.lat), lng: Number(props.selectedSB.lng) } : userOriginLoc) }} /></div>
                : null}
        </div>
    );
}

export default ShofarBlowerMap;