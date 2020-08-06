import React, { useState, useEffect, useContext } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps";

import { SBContext } from '../../ctx/shofar_blower_context';
import { MainContext } from '../../ctx/MainContext';

import MarkerGenerator, { SBMarkerGenerator } from './marker_generator';
import { SBSearchBoxGenerator } from './search_box_generator'

import { CONSTS } from '../../const_messages';

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

const getOverViewPath = async (google, origin, stops, extraData, cb = () => { }) => {
    if (!stops || !stops.length) { console.log("no_stops_or_destination", origin, stops); return cb(true); Promise.resolve([true]) }
    const travelMode = google.maps.TravelMode.WALKING
    const waypoints = stops
        .map(s => ({ location: new google.maps.LatLng(s.location.lat, s.location.lng), stopover: true }))
    let destination;
    try {
        destination = waypoints.pop().location
    } catch (e) {
        destination = {}
    }

    console.log('> origin: ', { ...origin });
    console.log('> waypoints: ', [...waypoints]);
    console.log('> destination: ', { ...destination });

    const directionsService = new google.maps.DirectionsService();
    directionsService.route({
        origin,
        travelMode,
        waypoints,
        destination: destination,
        optimizeWaypoints: false
    }, (result, status) => {
        // console.log('result: ', result);
        if (status !== google.maps.DirectionsStatus.OK) {
            cb("אירעה שגיאה בטעינת המפה, עמכם הסליחה")
            return;
            Promise.resolve(["אירעה שגיאה בטעינת המפה, עמכם הסליחה"])
        }
        let res = {}
        if (extraData && extraData.getTimes) {
            res.startTimes = []
            let leg;
            let prevStartTimeVal
            let legDuration
            for (let i in stops) {
                leg = result.routes[0].legs[i]
                legDuration = Number(leg.duration.value) * 1000
                if (!res.startTimes[i - 1]) {
                    if (!extraData.userData || !new Date(extraData.userData.startTime).getTime) continue;
                    prevStartTimeVal = new Date(extraData.userData.startTime).getTime()
                } else {
                    prevStartTimeVal = res.startTimes[i - 1].startTime + CONSTS.SHOFAR_BLOWING_DURATION_MS
                }
                res.startTimes.push({ duration: leg.duration, distance: leg.distance, meetingId: stops[i].meetingId, startTime: Number(prevStartTimeVal) + legDuration })
            }
        }
        res.overviewPath = result.routes[0].overview_path

        cb(null, res)
        return;
        Promise.resolve([null, res])

    })
}


export const SBMapComponent = withScriptjs(withGoogleMap((props) => {
    const { err, data } = props
    if (err) return null;
    if (!data) return <img alt="" className="loader" src='/images/loader.svg' />

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
        if (!Array.isArray(data.myMLocs) || !data.myMLocs.length) return;
        const userOrigin = { location: data.userOriginLoc, /* icon: userLocationIcon, */ origin: true } //! check if need userLocationIcon here
        const userStartTime = new Date(userData.startTime).getTime()
        const userEndTime = userStartTime + userData.maxRouteDuration;
        const routeStops = [];
        const constStopsB4 = [];
        const constStopsAfter = [];
        let meetingStartTime;

        //fill routeStops, constStopsb4 and constStopsAfter
        for (let i in data.myMLocs) {
            meetingStartTime = new Date(data.myMLocs[i].startTime).getTime()
            if (data.myMLocs[i].constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)) { // is a meeting set by sb and is not part of blowing route (is before sb said he starts or after his route finishes)
                if (meetingStartTime < userStartTime) {
                    constStopsB4.push(data.myMLocs[i])
                } else {
                    constStopsAfter.push(data.myMLocs[i])
                }
            }
            else routeStops.push(data.myMLocs[i])
        }

        if (Array.isArray(routeStops) && routeStops.length) { // my route overViewPath
            //get times only if there is a stop (a meeting) that doesn't have a start time
            //cos if they have start times it means: either we just calculated them before, or we have the times in the db (and nothing since has changed)
            let getTimes = routeStops.find(stop => !stop.startTime || !new Date(stop.startTime).getTime)
            getOverViewPath(window.google, userOrigin.location, routeStops, { getTimes: getTimes, userData },
                (err, res) => {
                    if (err) { console.log("err getoverviewpath ", err); if (typeof err === "string") { openGenAlert({ text: err }); } return }
                    let newStartTimes = res.startTimes;
                    if (newStartTimes && newStartTimes !== startTimes) setStartTimes(newStartTimes)
                    const getMyST = (mId) => {
                        let startTime = Array.isArray(newStartTimes) && newStartTimes.find(st => st.meetingId == mId)
                        if (startTime && startTime.startTime) return new Date(startTime.startTime).toJSON()
                        return false
                    }
                    getTimes && setMyMeetings(meets => meets.map(m => ({ ...m, startTime: getMyST(m.meetingId) || new Date(m.startTime).toJSON() })))
                    setRoutePath(res.overviewPath)
                })
        }
        const b4StopsCb = (b4Err, b4Res) => {
            // console.log('b4Res: ', b4Res);s
            if (b4Err) {
                console.log("err getoverviewpath for constStopsB4: ", constStopsB4, " err: ", b4Err); if (typeof b4Err === "string") { openGenAlert({ text: b4Err }); } return;
            }
            let overviewPaths = [];
            b4Res && overviewPaths.push(b4Res.overviewPath)

            if (Array.isArray(constStopsAfter) && constStopsAfter.length) { //const meeting after get overview
                let origin = Array.isArray(routeStops) && routeStops.length ? routeStops[routeStops.length - 1] : userOrigin
                getOverViewPath(window.google, origin.location, constStopsAfter, null, (e, r) => afterStopsCb(e, r, overviewPaths))
            } else afterStopsCb(null, null, overviewPaths)

        }
        const afterStopsCb = (afterErr, afterRes, overviewPaths) => {
            // console.log('afterRes: ', afterRes);
            if (afterErr) {
                console.log("err getoverviewpath for constStopsAfter: ", constStopsB4, " err: ", afterErr); if (typeof afterErr === "string") { openGenAlert({ text: afterErr }); } return;
            }
            afterRes && overviewPaths.push(afterRes.overviewPath)
            Array.isArray(overviewPaths) && setB4OrAfterRoutePath(overviewPaths)
            // console.log('setB4OrAfterRoutePath(to:): ', overviewPaths);
        }

        // console.log('constStopsB4: ', constStopsB4);
        if ((Array.isArray(constStopsB4) && constStopsB4.length) || (Array.isArray(constStopsAfter) && constStopsAfter.length)) {
            if ((Array.isArray(constStopsB4) && constStopsB4.length)) getOverViewPath(window.google, constStopsB4.pop().location, constStopsB4.length ? [...constStopsB4, userOrigin] : [userOrigin], null, b4StopsCb)
            else b4StopsCb(null, null)
        }

    }, [props.data])


    const changeMap = (e) => {
        setGenMap(v => !v)
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

    props.data && console.log('props.data: ', props.data);
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
                    />
                    :
                    <BringAllSBMapInfo
                        data={data}
                        b4OrAfterRoutePath={b4OrAfterRoutePath}
                        routePath={routePath}
                    />
            }
            {/* user location */}
            <SBMarkerGenerator location={data.userOriginLoc} markerIcon={userLocationIcon} />

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

const BringAllGenMapInfo = ({ allLocations }) => {
    if (!Array.isArray(allLocations)) return null;

    return <>{allLocations.map((locationInfo, index) => {
        return <MarkerGenerator key={index} blower locationInfo={locationInfo} /> /* all blowing meetings locations */
    })}</>
}