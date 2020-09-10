import React, { useState, useEffect, useContext } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";

import { SBContext } from '../../ctx/shofar_blower_context';
import { MainContext } from '../../ctx/MainContext';
import { AdminMainContext } from '../../scenes/admin/ctx/AdminMainContext';

import MarkerGenerator, { SBMarkerGenerator } from './marker_generator';
import { SBSearchBoxGenerator } from './search_box_generator'

import { getOverviewPath } from './get_overview_path';
import { CONSTS } from '../../consts/const_messages';

import { isBrowser } from "react-device-detect";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SBAllMeetingsList from '../sb_all_meetings_list';
import { updateMyStartTime, checkDateBlock, assignSB } from '../../fetch_and_utils';

import { logE } from '../../handlers/consoleLogHandler'
import { adminUpdateMyStartTime } from '../../scenes/admin/fetch_and_utils';
import { useRef } from 'react';

export const SBMapComponent = withScriptjs(withGoogleMap((props) => {
    const { err, data, isAdmin, selectedSB, handleForceAssign, assigned } = props
    // console.log('data: ', data);
    if (err) return <div className="loader">{typeof err === "string" ? err : "אירעה שגיאה, נא נסו שנית מאוחר יותר"}</div>;
    if (!data) return <img alt="נטען..." className="loader" src='/images/loader.svg' />
    const { openGenAlert } = useContext(MainContext)
    const sbctx = useContext(SBContext)
    const adminctx = useContext(AdminMainContext)

    const mapRef = useRef()

    let userData,
        setStartTimes, startTimes,
        setMyMeetings,
        isPrint, setIsPrint,
        totalLength,
        setSelectedIsolator
    if (sbctx && typeof sbctx === "object") {
        userData = sbctx.userData;
        setStartTimes = sbctx.setStartTimes;
        startTimes = sbctx.startTimes;
        setMyMeetings = sbctx.setMyMeetings;
        setIsPrint = sbctx.setIsPrint;
        totalLength = sbctx.totalLength;
        setSelectedIsolator = () => { }
    } else if (adminctx && typeof adminctx === "object") {
        setMyMeetings = props.setMeetingsOfSelectedSB
        userData = selectedSB
        startTimes = adminctx.startTimes
        setStartTimes = adminctx.setStartTimes
        setSelectedIsolator = adminctx.setSelectedIsolator
    }

    const userLocationInfo = isAdmin && selectedSB && typeof selectedSB === "object"
        ? <div id="info-window-container" className="limit-map-info-window-size">
            <div className="info-window-title bold blueText">בעל תוקע</div>
            <div className="pub-shofar-blower-name-container"><img alt="שם המחפש/ת" src={'/icons/shofar.svg'} /><div>{selectedSB.name}</div></div>
            <div className="pub-address-container"><img alt="מיקום" src={'/icons/address.svg'} /><div>{selectedSB.address}</div></div>
            <div className="pub-address-container" ><img src="טלפון" className="icon-on-map-locationInfo" src="/icons/phone.svg" /><div>{selectedSB.phone || selectedSB.username}</div></div>
        </div>
        : null
    const isolatorLocationInfo = isAdmin && props.data.selectedIsolatorLoc && typeof props.data.selectedIsolatorLoc === "object"
        ? <div id="info-window-container">
            <div className="info-window-title bold blueText">מחפש/ת</div>
            <div className="pub-shofar-blower-name-container"><img alt="שם המחפש/ת" src={'/icons/shofar.svg'} /><div>{props.data.selectedIsolatorLoc.name}</div></div>
            <div className="pub-address-container"><img alt="מיקום" src={'/icons/address.svg'} /><div>{props.data.selectedIsolatorLoc.address}</div></div>
            {assigned || !props.data.selectedIsolatorLoc ? null : <div onClick={handleForceAssign} className="pointer" id="assign-btn">שבץ</div>}
        </div>
        : null

    const userLocationIcon = {
        url: isAdmin ? "/icons/shofar-blue.svg" : '/icons/sb_origin.svg',
        scaledSize: isAdmin ? new window.google.maps.Size(30, 30) : new window.google.maps.Size(80, 80),
        // origin: new window.google.maps.Point(0, 0),
        anchor: isAdmin ? new window.google.maps.Point(15, 15) : new window.google.maps.Point(50, 50),
        // labelOrigin: new window.google.maps.Point(0, 60),
    }
    const isolatorLocationIcon = isAdmin ? {
        url: '/icons/single-orange.svg',
        scaledSize: isAdmin ? new window.google.maps.Size(50, 50) : new window.google.maps.Size(80, 80),
        // origin: new window.google.maps.Point(0, 0),
        anchor: isAdmin ? new window.google.maps.Point(25, 25) : new window.google.maps.Point(50, 50),
        // labelOrigin: new window.google.maps.Point(0, 60),
    } : null;


    const [routePath, setRoutePath] = useState(null)
    const [b4OrAfterRoutePath, setB4OrAfterRoutePath] = useState(null)
    const [genMap, setGenMap] = useState(false)
    const [showMeetingsList, setShowMeetingsList] = useState(false)
    const [showMeetingsListAni, setShowMeetingsListAni] = useState(false)

    useEffect(() => {
        if (totalLength === null) return
        let p
        try { p = new URLSearchParams(props.location.search).get("p") } catch (e) { }
        if (p !== "t") return
        window.onafterprint = (_e) => {
            window.history.replaceState({}, document.title, "/");
            setIsPrint(false);
        };
        setIsPrint(true);
    }, [totalLength])
    useEffect(() => {
        if (isPrint) { handlePrint() }
    }, [isPrint])

    useEffect(() => {
        if (data && Array.isArray(data.myMLocs)) {
            if (!data.myMLocs.length) {
                setRoutePath([])
            } else {
                setTimeout(() => { data && Array.isArray(data.myMLocs) && data.myMLocs.length && setData() }, 0)
            }
        }
    }, [data.myMLocs])

    const handlePrint = () => {
        document.scrollTop = 0
        window.print()
    }
    const setData = async () => {
        if (!Array.isArray(data.myMLocs)) return;
        const userOrigin = { location: data.userOriginLoc, origin: true }
        const userStartTime = isAdmin ? new Date(selectedSB.volunteering_start_time).getTime() : new Date(userData.startTime).getTime()
        const userEndTime = isAdmin ? (userStartTime + (Number(selectedSB.volunteering_max_time) * 60000)) : (userStartTime + userData.maxRouteDuration);
        const routeStops = [];
        const constStopsB4 = [];
        const constStopsAfter = [];
        let meetingStartTime;

        //fill routeStops, constStopsb4 and constStopsAfter
        for (let i in data.myMLocs) {
            meetingStartTime = new Date(data.myMLocs[i].startTime).getTime()
            if (data.myMLocs[i].constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)) {
                // is a meeting set by sb and is not part of blowing route (is before sb said he starts or after his route finishes)
                if (meetingStartTime < userStartTime) {
                    constStopsB4.push(data.myMLocs[i])
                } else {
                    // console.log('pushing as a AFTER const stop: ', data.myMLocs[i]);
                    constStopsAfter.push(data.myMLocs[i])
                }
            }
            else {
                routeStops.push(data.myMLocs[i])
            }
        }
        if (Array.isArray(routeStops) && routeStops.length) { // my route overViewPath
            try {
                if (routeStops.length > userData.can_blow_x_times && JSON.parse(sessionStorage.getItem('showAlertMaxBlowTimes'))) { //changed settings of his max number of meetings, but is assigned to more
                    openGenAlert({ text: `-שינית לאחרונה את המספר המקסימלי שלך לתקיעות בשופר ל${userData.can_blow_x_times}, -אך הינך רשום ל${routeStops.length} תקיעות. אם ברצונך למחוק מהמסלול שלך תקיעות, תוכל לעשות זאת ב ${isBrowser ? 'מסלול המוצג מימין' : 'מסלול המוצג בתחתית המסך'}`, isPopup: { okayText: "הבנתי" } });
                    sessionStorage.setItem('showAlertMaxBlowTimes', false); //update session storage in order to show the alert only once
                }
            } catch (_e) { }
            if (!Array.isArray(routeStops) || !routeStops.length) { setRoutePath([]); return }

            let [err, res] = await getOverviewPath(window.google, userOrigin.location, routeStops, { getTimes: true, userData })
            if (err) {
                // logE("getoverviewpath 1 : ", err);
                if (typeof err === "string") { openGenAlert({ text: err }); }
                return
            }
            let newStartTimes = res.startTimes;
            if (newStartTimes && newStartTimes !== startTimes) setStartTimes(newStartTimes)
            const getMyNewST = (mId, isPub) => {
                let startTime = Array.isArray(newStartTimes) && newStartTimes.find(st => st.meetingId == mId && st.isPublicMeeting == isPub)
                if (startTime && startTime.startTime) return new Date(startTime.startTime).toJSON()
                return false
            }
            const meetingsToUpdateST = [];
            for (let m of routeStops) { //loop current stops and their start times
                let myNewStartTime = getMyNewST(m.meetingId || m.id, m.isPublicMeeting)
                if ((!m.startTime || new Date(m.startTime).toJSON() != myNewStartTime) && (m.id || m.meetingId) && (m.isPublicMeeting != null && m.isPublicMeeting != undefined)) //compare with newly calculated start time
                    meetingsToUpdateST.push({ meetingId: m.meetingId || m.id, isPublicMeeting: m.isPublicMeeting, startTime: myNewStartTime })
            }
            if (meetingsToUpdateST && meetingsToUpdateST.length) {
                if (isAdmin) {
                    adminUpdateMyStartTime(meetingsToUpdateST, (error => {
                        if (error) { openGenAlert({ text: typeof error === "string" ? error : "אירעה שגיאה בעת שמירת הנתונים" }); logE('adminUpdateMyStartTime error: ', error); }
                    }))
                }
                else if (!checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
                    updateMyStartTime(meetingsToUpdateST, (error => {
                        if (error) { openGenAlert({ text: error === CONSTS.CURRENTLY_BLOCKED_ERR ? "מועד התקיעה מתקרב, לא ניתן לבצע שינויים במסלול" : error }); logE('updateMyStartTime error: ', error); }
                    }))
                }
                setMyMeetings(meets => meets.map(m => {
                    let newMMStartTime = meetingsToUpdateST.find(mToUpdate => mToUpdate.meetingId == m.meetingId && mToUpdate.isPublicMeeting == m.isPublicMeeting)
                    if (!newMMStartTime) return m
                    return { ...m, startTime: newMMStartTime.startTime }
                }))
            }
            if (!Array.isArray(routeStops) || !routeStops.length)
                setRoutePath([])
            else {
                if (Array.isArray(routeStops) && routeStops.length)
                    setRoutePath(res.overviewPath)
            }
        } else setRoutePath([])

        //get const meetings overview
        let constOverviewPaths = [];
        if (Array.isArray(constStopsB4) && constStopsB4.length) {
            //const meeting b4 -- get path
            let [constB4Err, constB4Res] = await getOverviewPath(window.google, constStopsB4.pop().location, constStopsB4.length ? [...constStopsB4, userOrigin] : [userOrigin], null)
            if (constB4Err) {
                if (typeof constB4Err === "string") { openGenAlert({ text: constB4Err }); }
            }
            if (constB4Res) {
                constOverviewPaths.push(constB4Res.overviewPath)
            }
        }
        if (Array.isArray(constStopsAfter) && constStopsAfter.length) {
            let origin = Array.isArray(routeStops) && routeStops.length ? routeStops[routeStops.length - 1] : userOrigin
            //const meeting after -- get path
            let [constAfterErr, constAfterRes] = await getOverviewPath(window.google, origin.location, constStopsAfter, null)
            if (constAfterErr) {
                if (typeof constAfterErr === "string") { openGenAlert({ text: constAfterErr }); }
            }
            if (constAfterRes) {
                constOverviewPaths.push(constAfterRes.overviewPath)
            }
        }
        Array.isArray(constOverviewPaths) && setB4OrAfterRoutePath(constOverviewPaths)
    }


    //MAP RESTRICTIONS - ISRAEL --START
    var israelPolygon = new window.google.maps.Polygon({
        paths: CONSTS.ISRAEL_COORDS,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35
    });
    var bounds = new window.google.maps.LatLngBounds();

    if (!israelPolygon || typeof israelPolygon.getPaths !== "function" || !israelPolygon.getPaths() || typeof israelPolygon.getPaths().getLength !== "function") return null
    for (var i = 0; i < israelPolygon.getPaths().getLength(); i++) {
        for (var j = 0; j < israelPolygon.getPaths().getAt(i).getLength(); j++) {
            bounds.extend(israelPolygon.getPaths().getAt(i).getAt(j));
        }
    }
    let mapOptions = CONSTS.MAP_OPTIONS;
    mapOptions.restriction = {
        latLngBounds: bounds,
        strictBounds: false
    }
    //MAP RESTRICTIONS - ISRAEL --END


    let sideListTO = null;
    const closeSideMeetingsList = () => {
        sideListTO && clearTimeout(sideListTO)
        if (showMeetingsList) sideListTO = setTimeout(() => { setShowMeetingsList(false) }, 400)
        setShowMeetingsListAni(false)
    }
    const changeMap = () => setGenMap(v => { props.handleMapChanged(!v); return !v })
    return (
        <GoogleMap
            ref={mapRef}
            defaultZoom={18}
            defaultOptions={mapOptions}
            center={props.center}
            onClick={closeSideMeetingsList}
            onDrag={closeSideMeetingsList}
            onCenterChanged={() => { props.onCenterChanged(mapRef.current.getCenter()) }}
        >
            {
                genMap ?
                    <BringAllGenMapInfo
                        allLocations={props.allGenLocations}
                    />
                    :
                    <BringAllSBMapInfo
                        data={data}
                        b4OrAfterRoutePath={b4OrAfterRoutePath}
                        routePath={routePath}
                        showIsolators={props.showIsolators}
                        isolators={props.isolators}
                        handleForceAssign={handleForceAssign}
                        setSelectedIsolator={setSelectedIsolator}
                    />
            }
            {/* user location */}
            <SBMarkerGenerator location={data.userOriginLoc} markerIcon={userLocationIcon} info={userLocationInfo} defaultInfoState={isAdmin} /> {/* might need to disable when genMap is on */}
            {isAdmin && data.selectedIsolatorLoc && data.selectedIsolatorLoc.location ?
                <SBMarkerGenerator location={data.selectedIsolatorLoc.location} markerIcon={isolatorLocationIcon} info={isolatorLocationInfo} defaultInfoState={isAdmin} />
                : null
            }
            {isAdmin ? null :
                <div className={isBrowser ? "sb-overmap-container" : "sb-overmap-container sb-overmap-container-mobile"}>
                    {isBrowser ? null : <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img alt="" src="/icons/settings.svg" /></div>}
                    <div className={`map-change-all ${isBrowser ? "map-change" : "map-change-mobile"} clickAble`} onClick={changeMap} >
                        <div>{genMap ? "מפה אישית" : "מפה כללית"}</div>
                    </div>
                    {isBrowser ? <SBSearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />
                        :
                        <div className={`list-switch-container-mobile clickAble`} onClick={() => { setShowMeetingsList(true); setShowMeetingsListAni(true) }} >
                            <FontAwesomeIcon icon="list-ul" className="list-switch-icon" />
                            <div className="list-switch-text">הצג מחפשים ברשימה</div>
                        </div>}
                    {showMeetingsList ?
                        <div className={`sb-side-list-content-mobile ${showMeetingsListAni ? "open-side-list" : "close-side-list"}`} >
                            <SBAllMeetingsList />
                        </div>
                        : null
                    }
                </div>
            }
        </GoogleMap>
    );
}));

const BringAllSBMapInfo = ({ data, b4OrAfterRoutePath, routePath, showIsolators, isolators, handleForceAssign, setSelectedIsolator }) => (
    <>
        {/* reqsLocs */
            Array.isArray(data.reqsLocs) && data.reqsLocs.length ?
                data.reqsLocs.map((m, index) => !m.location ? null : <SBMarkerGenerator key={index} iconType={m.iconType} location={m.location} defaultInfoState={false} info={m.info} />)
                : null}
        {/* myMLocs */
            Array.isArray(data.myMLocs) && data.myMLocs.length ?
                data.myMLocs.map((m, index) => !m.location ? null : <SBMarkerGenerator key={index} iconUrl={m.iconUrl} iconType={m.iconType} defaultInfoState={false} location={m.location} info={m.info} />)
                : null}

        {Array.isArray(routePath) ?
            <Polyline
                path={routePath}
                geodesic={false}
                options={{ strokeColor: '#82C0CC', strokeOpacity: 0.62, strokeWeight: 7, }}
            />
            : null
        }

        {/* before and after route stops */
            Array.isArray(b4OrAfterRoutePath) && b4OrAfterRoutePath.length ?
                b4OrAfterRoutePath.map((routePath, i) => (
                    <Polyline
                        key={"k" + i}
                        path={routePath}
                        geodesic={false}
                        options={{ strokeColor: "#ffa62b", strokeOpacity: Number(i * 0.1) + 0.54, strokeWeight: 3 }}
                    />
                ))
                : null}

        {showIsolators && isolators.map((isolator, index) =>
            <SBMarkerGenerator
                key={index}
                markerIcon={{
                    url: '/icons/singleOrange.svg',
                    scaledSize: { width: 25, height: 25 },
                    anchor: { x: 12.5, y: 12.5 }
                }}
                onClick={() => {  }}
                location={{ lat: Number(isolator.lat), lng: Number(isolator.lng) }}
                info={<div className="infoWindowContainer">
                    <div className="infoWindowTitle bold blueText">{`מחפש/ת ${isolator.isPublicMeeting ? "תקיעה ציבורית" : "תקיעה פרטית"}`}</div>
                    <div className="pubShofarBlowerNameContainer">
                        <img alt="" src='/icons/shofar.svg' />
                        <div>{isolator.name}</div>
                    </div>
                    <div className="pubAddressContainer">
                        <img alt="" src='/icons/address.svg' />
                        <div>{isolator.address}</div>
                    </div>
                    {/* <div className="pub-address-container" ><FontAwesomeIcon className="icon-on-map-locationInfo" icon="phone" /><div>{shofarBlower.username}</div></div> */}
                    <div className='infoWindowButton pointer' onClick={() => { setSelectedIsolator(isolator); handleForceAssign("PLEASE_TAKE_ME_I_CAME_FROM_SB_MAP_AND_HAVE_NO_SELECTED_ISOLATOR_COS_IT_IS_I", isolator) }}>שבץ</div>
                </div>}
            />
        )}

    </>
);

const BringAllGenMapInfo = ({ allLocations }) => {
    if (!allLocations || typeof allLocations !== "object") return null;

    return <>
        {Array.isArray(allLocations.priMeetLocs) ? allLocations.priMeetLocs.map((locationInfo, index) => {
            return <MarkerGenerator key={index} blower locationInfo={locationInfo} /> /* all blowing meetings locations */
        }) : null}
        {Array.isArray(allLocations.pubMeetLocs) ? allLocations.pubMeetLocs.map((locationInfo, index) => {
            return <MarkerGenerator key={index} blower locationInfo={locationInfo} /> /* all blowing meetings locations */
        }) : null}
    </>
}