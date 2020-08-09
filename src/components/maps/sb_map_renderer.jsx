import React, { useState, useEffect, useContext } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";

import { SBContext } from '../../ctx/shofar_blower_context';
import { MainContext } from '../../ctx/MainContext';

import { SBMarkerGenerator } from './marker_generator';
import { SBSearchBoxGenerator } from './search_box_generator'

import { getOverviewPath } from './get_overview_path';

import { isBrowser } from "react-device-detect";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SBAllMeetingsList from '../sb_all_meetings_list';

const mapOptions = {
    fullscreenControl: false,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    componentRestrictions: { country: "il" },
    clickableIcons: false
};
const israelCoords = [
    { lat: 32.863532, lng: 35.889902 },
    { lat: 33.458826, lng: 35.881345 },
    { lat: 33.107715, lng: 35.144508 },
    { lat: 31.296718, lng: 34.180102 },
    { lat: 29.486869, lng: 34.881321 },
    { lat: 29.551662, lng: 34.984779 },
];



export const SBMapComponent = withScriptjs(withGoogleMap((props) => {
    const { err, data } = props
    if (err) return null;
    if (!data) return <img alt="נטען..." className="loader" src='/images/loader.svg' />
    const { openGenAlert } = useContext(MainContext)
    const {
        userData,
        setStartTimes, startTimes,
        setMyMeetings
    } = useContext(SBContext)

    const [routePath, setRoutePath] = useState(null)
    const [b4OrAfterRoutePath, setB4OrAfterRoutePath] = useState(null)
    const [genMap, setGenMap] = useState(false)
    const [showMeetingsList, setShowMeetingsList] = useState(false)
    const [showMeetingsListAni, setShowMeetingsListAni] = useState(false)

    const userLocationIcon = {
        url: '/icons/sb_origin.svg',
        scaledSize: new window.google.maps.Size(100, 100),
        // origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(50, 50),
        // labelOrigin: new window.google.maps.Point(0, 60),
    }

    useEffect(() => {
        console.log('data changed: ', data);
        if (data && Array.isArray(data.myMLocs) && data.myMLocs.length) setData()
    }, [])

    const setData = async () => {
        if (!Array.isArray(data.myMLocs) || !data.myMLocs.length) return;
        const userOrigin = { location: data.userOriginLoc, origin: true }
        const userStartTime = new Date(userData.startTime).getTime()
        const userEndTime = userStartTime + userData.maxRouteDuration;
        const routeStops = [];
        const constStopsB4 = [];
        const constStopsAfter = [];
        let meetingStartTime;
        console.log('userStartTime: ', new Date(userData.startTime));
        for (let i in data.myMLocs) {
            meetingStartTime = new Date(data.myMLocs[i].startTime).getTime()
            console.log('meetingStartTime: ', new Date(data.myMLocs[i].startTime));
            console.log('data.myMLocs[i]: ', data.myMLocs[i]);
            if (data.myMLocs[i].constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)) {
                // is a meeting set by sb and is not part of blowing route (is before sb said he starts or after his route finishes)
                if (meetingStartTime < userStartTime) {
                    // console.log('pushing as a b4 const stop: ', data.myMLocs[i]);
                    constStopsB4.push(data.myMLocs[i])
                } else {
                    // console.log('pushing as a AFTER const stop: ', data.myMLocs[i]);
                    constStopsAfter.push(data.myMLocs[i])
                }
            }
            else routeStops.push(data.myMLocs[i])
        }
        if (Array.isArray(routeStops) && routeStops.length) { // my route overViewPath
            //get times only if there is a stop (a meeting) that doesn't have a start time
            //cos if they have start times it means: either we just calculated them before, or we have the times in the db (and nothing since has changed)
            // let getTimes = routeStops.find(stop => !stop.startTime || !new Date(stop.startTime).getTime)
            let getTimes = true
            let [err, res] = await getOverviewPath(window.google, userOrigin.location, routeStops, { getTimes: getTimes, userData })
            if (err) { console.log("err getoverviewpath 1 : ", err); if (typeof err === "string") { openGenAlert({ text: err }); } return }
            let newStartTimes = res.startTimes;
            if (newStartTimes && newStartTimes !== startTimes) setStartTimes(newStartTimes)
            const getMyST = (mId) => {
                let startTime = Array.isArray(newStartTimes) && newStartTimes.find(st => st.meetingId == mId)
                if (startTime && startTime.startTime) return new Date(startTime.startTime).toJSON()
                return false
            }
            getTimes && setMyMeetings(meets => meets.map(m => ({ ...m, startTime: getMyST(m.meetingId) || new Date(m.startTime).toJSON() })))
            console.log('1 res.overviewPath: ', res.overviewPath);
            setRoutePath(res.overviewPath)
        }

        //get const meetings overview
        let constOverviewPaths = [];
        if (Array.isArray(constStopsB4) && constStopsB4.length) {
            //const meeting b4 -- get path
            let [constB4Err, constB4Res] = await getOverviewPath(window.google, constStopsB4.pop().location, constStopsB4.length ? [...constStopsB4, userOrigin] : [userOrigin], null)
            if (constB4Err) {
                console.log("err getoverviewpath 2 : ", constStopsB4, " err: ", constB4Err);
                if (typeof constB4Err === "string") { openGenAlert({ text: constB4Err }); }
            }
            if (constB4Res) {
                console.log('2 constB4Res.overviewPath: ', constB4Res.overviewPath);
                constOverviewPaths.push(constB4Res.overviewPath)
            }
        }
        if (Array.isArray(constStopsAfter) && constStopsAfter.length) {
            let origin = Array.isArray(routeStops) && routeStops.length ? routeStops[routeStops.length - 1] : userOrigin
            //const meeting after -- get path
            let [constAfterErr, constAfterRes] = await getOverviewPath(window.google, origin.location, constStopsAfter, null)
            if (constAfterErr) {
                // console.log("err getoverviewpath 3 : ", constStopsAfter, " err: ", constAfterErr);
                if (typeof constAfterErr === "string") { openGenAlert({ text: constAfterErr }); }
            }
            if (constAfterRes) {
                console.log('3 constAfterRes.overviewPath: ', constAfterRes.overviewPath);
                constOverviewPaths.push(constAfterRes.overviewPath)
            }
        }
        // console.log('final constOverviewPaths: ', constOverviewPaths);
        Array.isArray(constOverviewPaths) && setB4OrAfterRoutePath(constOverviewPaths)
    }


    //MAP RESTRICTIONS - ISRAEL --START
    var israelPolygon = new window.google.maps.Polygon({
        paths: israelCoords,
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
            defaultZoom={16} //!change back to 20
            defaultOptions={mapOptions}
            center={props.center}
            onClick={closeSideMeetingsList}
            onDrag={closeSideMeetingsList}
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
                    />
            }
            {/* user location */}
            <SBMarkerGenerator location={data.userOriginLoc} markerIcon={userLocationIcon} /> {/* might need to disable when genMap is on */}

            <div className={isBrowser ? "sb-overmap-container" : "sb-overmap-container sb-overmap-container-mobile"}>
                {isBrowser ? null : <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img alt="" src="/icons/settings.svg" /></div>}
                <div className={`map-change-all ${isBrowser ? "map-change" : "map-change-mobile"} clickAble`} onClick={changeMap} >{genMap ? "מפה אישית" : "מפה כללית"}</div>
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

        </GoogleMap>
    );
}));

const BringAllSBMapInfo = ({ data, b4OrAfterRoutePath, routePath }) => (
    <>
        {/* reqsLocs */
            Array.isArray(data.reqsLocs) && data.reqsLocs.length ?
                data.reqsLocs.map((m, index) => !m.location ? null : <SBMarkerGenerator key={index} type={m.type} location={m.location} info={m.info} />)
                : null}
        {/* myMLocs */
            Array.isArray(data.myMLocs) && data.myMLocs.length ?
                data.myMLocs.map((m, index) => !m.location ? null : <SBMarkerGenerator key={index} type={m.iconType} location={m.location} info={m.info} />)
                : null}

        {Array.isArray(routePath) ?
            <Polyline
                path={routePath}
                geodesic={false}
                options={{ strokeColor: '#82C0CC', strokeOpacity: "62%", strokeWeight: 7, }}
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
                        options={{ strokeColor: "purple", strokeOpacity: `${Number(i * 10) + 62}%`, strokeWeight: 2 + Number(i * 2) }}
                    //todo: check change of opacity (i * 10?)
                    />
                ))
                : null}

    </>
);

const BringAllGenMapInfo = () => {
    /*
        todo: רעות אני צריכה אותך פה בשביל להביא את המידע מהמפה הכללית, אי אפשר להביא את כל ה
        todo: Map component
        todo: כי יש צורך *רק* בנקודות ציון יעני, אני צריכה לשמור על *כל* שאר הדברים שלי, נגיד הכפתור לעבור בין המפות
    */
    return <></>
}