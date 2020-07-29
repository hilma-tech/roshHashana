import React, { useState, useEffect, useContext } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";

import MarkerGenerator from './marker_generator';
import SearchBoxGenerator from './search_box_generator'
import { SBContext } from '../../ctx/shofar_blower_context';

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


const calculateRoute = (google, setRouteCoordinates, userData, places) => {
    console.log('places: ', places);
    if (!Array.isArray(places)) return
    // console.log('waypoints: ', waypoints);
    const travelMode = google.maps.TravelMode.WALKING
    const waypoints = places.map(p => ({
        location: p.location,
        stopover: true
    }))
    const origin = waypoints.shift().location;
    const destination = waypoints.length ? waypoints.pop().location : null;
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: travelMode,
            waypoints: waypoints,
            optimizeWaypoints: false
        },
        (result, status) => {
            console.log('result: ', result);
            if (status === google.maps.DirectionsStatus.OK) {
                //OK
                try {
                    const overViewCoords = result.routes[0].overview_path;
                    setRouteCoordinates(overViewCoords)
                    const legCnt = 0
                    let prevI = 0
                    let centerMarkers = []
                    let centerL, duration
                    let coord
                    let centerCoordsI;
                    for (let i in overViewCoords) {
                        coord = overViewCoords[i]
                        if (coord.lng() == result.routes[0].legs[legCnt].end_location.lng() && coord.lat() == result.routes[0].legs[legCnt].end_location.lat()) {
                            // got to a coord which is a waypoint (a leg)
                            centerCoordsI = Math.floor((i + prevI) / 2)
                            centerL = overViewCoords[centerCoordsI]
                            duration = result.routes[0].legs[legCnt].duration.text
                            centerMarkers.push({ location: centerL, duration })
                            prevI = coord;
                            legCnt++;
                        }
                    }
                    console.log('centerMarkers: ', centerMarkers);
                } catch (e) { console.log("error getting overview path from DirectionsService() result", e) }
                try {
                    let leg;
                    let start_loc, end_loc
                    let start_place, end_place
                    let leg_time
                    let newStartTimes = []
                    for (let i in result.routes[0].legs) {
                        leg = result.routes[0].legs[i]
                        console.log('leg: ', leg);
                        start_loc = { lng: leg.start_location.lng(), lat: leg.start_location.lat() }
                        end_loc = { lng: leg.end_location.lng(), lat: leg.end_location.lat() }
                        //find the meeting id of start_loc and of end_loc
                        start_place = places.find(p => p.location && p.location.lng == start_loc.lng)
                        end_place = places.find(p => p.location && p.location.lat == end_loc.lat)
                        if (start_place && start_place.origin) {
                            leg_time = new Date(userData.startTime).getTime() + leg.duration.value
                            console.log('calculated with origin, leg_time (mins): ', leg_time % 60000);
                            newStartTimes.push({ meetingId: end_place.meetingId, isPublicMeeting: end_place.type == PRIVATE_MEETING ? false : true, startTime: leg_time })
                            continue
                        }
                        console.log('start_place && start_place.startTime: ', start_place && start_place.startTime);
                        if (start_place && start_place.startTime) {
                            leg_time = new Date(start_place.startTime).getTime() + leg.duration.value
                            console.log('calculated with prev stop: leg_time (mins): ', leg_time % 60000);
                            newStartTimes.push({ meetingId: end_place.meetingId, isPublicMeeting: end_place.type == PRIVATE_MEETING ? false : true, startTime: leg_time })
                        }
                    } // legs for end
                    // setMyMeetings()
                    // setStartTimesToUpdate(startTimes => Array.isArray(startTimes) ? startTimes.map(m => { let newM = newStartTimes.find(newM => newM.meetingId == m.meetingId); return newM || m }) : newStartTimes)
                    console.log('newStartTimes: ', newStartTimes);
                    // openGenAlert({ text: " כבר משבצים ... " })
                    //! ^

                } catch (e) { console.log("error getting start times from result ", e); }
            } else {
                //failed
                console.log('ERROR result: ', result);
                setRouteCoordinates(" אירעה שגיאה, לא ניתן כעת להשתבץ לפגישה זו ")
            }
        }
    );
};



const getOverViewPath = (google, origin, stops, extraData, cb = () => { }) => {
    if (!stops || !stops.length) { console.log("no_stops_or_destination", origin, stops); cb(true) }
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
        console.log('result: ', result);
        if (status !== google.maps.DirectionsStatus.OK) {
            return cb("אירעה שגיאה בטעינת המפה, עמכם הסליחה")
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
                    prevStartTimeVal = res.startTimes[i - 1].startTime
                }
                res.startTimes.push({ duration: leg.duration, distance: leg.distance, meetingId: stops[i].meetingId, startTime: Number(prevStartTimeVal) + legDuration })
            }
        }
        res.overviewPath = result.routes[0].overview_path

        cb(null, res)
        return;

    })
}


export const MyMapComponent = withScriptjs(withGoogleMap((props) => {
    const { data } = props
    if (!data) return <div>loading</div>

    const { openGenAlert, userData,
        setStartTimes, startTimes,
        setMyMeetings
    } = useContext(SBContext)

    const [routePath, setRoutePath] = useState(null)
    const [b4OrAfterRoutePath, setB4OrAfterRoutePath] = useState(null)

    const userLocationIcon = {
        url: '/icons/sb_origin.svg',
        scaledSize: new window.google.maps.Size(100, 100),
        // origin: new window.google.maps.Point(0, 0),
        // anchor: new window.google.maps.Point(0, 0),
        // labelOrigin: new window.google.maps.Point(0, 60),
    }

    useEffect(() => {
        if (!Array.isArray(data.myMLocs) || !data.myMLocs.length) return;
        const userOrigin = { location: data.userOriginLoc, icon: userLocationIcon, origin: true }
        const userStartTime = new Date(userData.startTime).getTime()
        const userEndTime = userStartTime + userData.maxRouteDuration;
        console.log('userStartTime: ', userStartTime);
        console.log('userEndTime: ', userEndTime);
        const routeStops = [];
        const constStopsB4 = [];
        const constStopsAfer = [];
        let meetingStartTime;
        for (let i in data.myMLocs) {
            meetingStartTime = new Date(data.myMLocs[i].startTime).getTime()
            if (data.myMLocs[i].constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)) { // is a meeting set by sb and is not part of blowing route (is before sb said he starts or after his route finishes)
                if (meetingStartTime < userStartTime) {
                    // console.log('pushing as a b4 const stop: ', data.myMLocs[i]);
                    constStopsB4.push(data.myMLocs[i])
                } else {
                    // console.log('pushing as a AFTER const stop: ', data.myMLocs[i]);
                    constStopsAfer.push(data.myMLocs[i])
                }
            }
            else routeStops.push(data.myMLocs[i])
        }
        // console.log('constStopsB4: ', constStopsB4);
        // console.log('constStopsAfer: ', constStopsAfer);

        if (Array.isArray(routeStops) && routeStops.length) { // my route overViewPath
            //get times only if there is a stop (a meeting) that doesn't have a start time
            //cos if they have start times it means: either we just calculated them before, or we have the times in the db (and nothing since has changed)
            let getTimes = routeStops.find(stop => !stop.startTime || !new Date(stop.startTime).getTime)
            getOverViewPath(window.google, userOrigin.location, routeStops, { getTimes: getTimes, userData },
                (err, res) => {
                    if (err) { console.log("err getoverviewpath ", err); if (typeof err === "string") { openGenAlert({ text: err }); } return }
                    let newStartTimes = res.startTimes;
                    if (newStartTimes !== startTimes) setStartTimes(newStartTimes)
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

            if (Array.isArray(constStopsAfer) && constStopsAfer.length) { //const meeting after get overview
                let origin = Array.isArray(routeStops) && routeStops.length ? routeStops[routeStops.length - 1] : userOrigin
                getOverViewPath(window.google, origin.location, constStopsAfer, null, (e, r) => afterStopsCb(e, r, overviewPaths))
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
        if ((Array.isArray(constStopsB4) && constStopsB4.length) || (Array.isArray(constStopsAfer) && constStopsAfer.length)) {
            if ((Array.isArray(constStopsB4) && constStopsB4.length)) getOverViewPath(window.google, constStopsB4.pop().location, constStopsB4.length ? [...constStopsB4, userOrigin] : [userOrigin], null, b4StopsCb)
            else b4StopsCb(null, null)
        }

    }, [props.data])

    props.data && console.log('props.data: ', props.data);

    return (
        <GoogleMap
            defaultZoom={16} //!change back to 20
            defaultOptions={mapOptions}
            center={props.center}
        >
            <SearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />

            {/* reqsLocs */
                Array.isArray(data.reqsLocs) && data.reqsLocs.length ? data.reqsLocs.map((locationInfo, index) => {
                    return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
                }) : null}
            {/* myMLocs */
                Array.isArray(data.myMLocs) && data.myMLocs.length ? data.myMLocs.map((locationInfo, index) => {
                    return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
                }) : null}
            {/* user location */}
            <MarkerGenerator position={data.userOriginLoc} icon={userLocationIcon} />
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
                            options={{ strokeColor: "purple", strokeOpacity: "62%", strokeWeight: 2 + Number(i * 2) }}
                        />
                    ))
                    : null}

        </GoogleMap>
    );
}));
