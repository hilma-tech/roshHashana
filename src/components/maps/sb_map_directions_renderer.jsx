import React, { useState, useEffect, useContext } from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline, OverlayView, InfoWindow, DirectionsRenderer } from "react-google-maps";

import MarkerGenerator from './marker_generator';
import SearchBoxGenerator from './search_box_generator'

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


export const calculateRoute = (google, setRouteCoordinates, userData, places) => {
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
                            // got to a coor which is a waypoint (a leg)
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



const getOverViewPath = (google, origin, stops, cb = () => { }) => {
    if (!stops || !stops.length) cb("no_stops")
    const travelMode = google.maps.TravelMode.WALKING
    const waypoints = stops.map(s => ({ location: new google.maps.LatLng(s.location.lat, s.location.lng), stopover: true }))
    const destination = waypoints.pop().location

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

        let res = {}

        res.overviewPath = result.routes[0].overview_path

        return cb(null, res)

    })
}


export const MyMapComponent = withScriptjs(withGoogleMap((props) => {
    console.log('props.data: ', props.data);
    const { data } = props
    if (!data) return <div>loading</div>

    const [routeCoordinates, setRouteCoordinates] = useState(null)

    const userLocationIcon = {
        url: '/icons/sb_origin.svg',
        scaledSize: new window.google.maps.Size(100, 100),
        // origin: new window.google.maps.Point(0, 0),
        // anchor: new window.google.maps.Point(0, 0),
        // labelOrigin: new window.google.maps.Point(0, 60),
    }
    const userOrigin = { location: data.userOriginLoc, icon: userLocationIcon, origin: true }
    const stops = [...data.myMLocs]

    useEffect(() => {
        getOverViewPath(window.google, userOrigin.location, stops,
            (err, res) => {
                if (err) { console.log("err getoverviewpath ", err); return }

                setRouteCoordinates(res.overviewPath)
            })
    }, [])


    // if (Array.isArray(props.myMeetingsLocs) && !routeCoordinates) calculateRoute(window.google, setRouteCoordinates, props.userData, [userOrigin, ...props.myMeetingsLocs])

    return (
        <GoogleMap
            defaultZoom={16} //!change back to 20
            defaultOptions={mapOptions}
            center={props.center}
        >
            <SearchBoxGenerator changeCenter={props.changeCenter} center={props.center} />

            {/* reqsLocs */ Array.isArray(data.reqsLocs) && data.reqsLocs.length ? data.reqsLocs.map((locationInfo, index) => {
                return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
            }) : null}
            {/* myMLocs */ Array.isArray(data.myMLocs) && data.myMLocs.length ? data.myMLocs.map((locationInfo, index) => {
                return <MarkerGenerator key={index} locationInfo={locationInfo} /> /* meetings locations */
            }) : null}
            {/* user location */} <MarkerGenerator position={data.userOriginLoc} icon={userLocationIcon} />
            {Array.isArray(routeCoordinates) ?
                <Polyline
                    path={routeCoordinates}
                    geodesic={false}
                    options={{ strokeColor: '#82C0CC', strokeOpacity: "62%", strokeOpacity: 1, strokeWeight: 7, }}
                />
                : null
            }
        </GoogleMap>
    );
}));



// const MyMapDirectionsRenderer = (props) => {
//     const { openGenAlert,
//         userData, myMeetings, setMyMeetings,
//         startTimesToUpdate, setStartTimesToUpdate } = useContext(SBContext)
//     const [state, setState] = useState({
//         lineCoordinates: null,
//         markerCenter: null
//     });
//     const { places } = props; // [{ location: {}, isPublic: t/f,  }, { location: {} }]

//     useEffect(() => {
//         console.log('places: ', places);
//         const travelMode = window.google.maps.TravelMode.WALKING
//         const waypoints = places.map(p => ({
//             location: p.location,
//             stopover: true
//         }))
//         const origin = waypoints.shift().location;
//         const destination = waypoints.length ? waypoints.pop().location : null;

//         const directionsService = new window.google.maps.DirectionsService();
//         directionsService.route(
//             {
//                 origin: origin,
//                 destination: destination,
//                 travelMode: travelMode,
//                 waypoints: waypoints,
//                 optimizeWaypoints: false
//             },
//             (result, status) => {
//                 console.log('result: ', result);
//                 if (status === window.google.maps.DirectionsStatus.OK) {
//                     //OK
//                     try {
//                         const overViewCoords = result.routes[0].overview_path;
//                         const legCnt = 0
//                         let prevI = 0
//                         let centerMarkers = []
//                         let centerL, duration
//                         let i
//                         for (let j in overViewCoords) {
//                             i = overViewCoords[j]
//                             if (i.lng() == result.routes[0].legs[legCnt].end_location.lng() && i.lat() == result.routes[0].legs[legCnt].end_location.lat()) {
//                                 console.log('equals:', i.lng() == result.routes[0].legs[legCnt].end_location.lng() && i.lat() == result.routes[0].legs[legCnt].end_location.lat());
//                                 centerL = overViewCoords[Math.floor((i - prevI) / 2)]
//                                 j < 10 && console.log('centerL: ', centerL);
//                                 duration = result.routes[0].legs[legCnt].duration.text
//                                 prevI = i;
//                                 legCnt++;
//                             }

//                         }
//                         setState(state => ({ ...state, lineCoordinates: overViewCoords, markerCenter: {} }));
//                     } catch (e) { console.log("error getting overview path from DirectionsService() result", e) }
//                     try {
//                         console.log('origin: ', origin);
//                         console.log('userData: ', userData);
//                         let leg;
//                         let start_loc, end_loc
//                         let start_place, end_place
//                         let leg_time
//                         let newStartTimes = []
//                         for (let i in result.routes[0].legs) {
//                             leg = result.routes[0].legs[i]
//                             console.log('leg: ', leg);
//                             start_loc = { lng: leg.start_location.lng(), lat: leg.start_location.lat() }
//                             end_loc = { lng: leg.end_location.lng(), lat: leg.end_location.lat() }
//                             //find the meeting id of start_loc and of end_loc
//                             start_place = places.find(p => p.location && p.location.lng == start_loc.lng)
//                             end_place = places.find(p => p.location && p.location.lat == end_loc.lat)
//                             if (start_place && start_place.origin) {
//                                 leg_time = new Date(userData.startTime).getTime() + leg.duration.value
//                                 console.log('calculated with origin, leg_time (mins): ', leg_time % 60000);
//                                 newStartTimes.push({ meetingId: end_place.meetingId, isPublicMeeting: end_place.type = PRIVATE_MEETING ? false : true, startTime: leg_time })
//                                 continue
//                             }
//                             console.log('start_place && start_place.startTime: ', start_place && start_place.startTime);
//                             if (start_place && start_place.startTime) {
//                                 leg_time = new Date(start_place.startTime).getTime() + leg.duration.value
//                                 console.log('calculated with prev stop: leg_time (mins): ', leg_time % 60000);
//                                 newStartTimes.push({ meetingId: end_place.meetingId, isPublicMeeting: end_place.type = PRIVATE_MEETING ? false : true, startTime: leg_time })
//                             }
//                         } // legs for end
//                         // setMyMeetings()
//                         // setStartTimesToUpdate(startTimes => Array.isArray(startTimes) ? startTimes.map(m => { let newM = newStartTimes.find(newM => newM.meetingId == m.meetingId); return newM || m }) : newStartTimes)
//                         console.log('newStartTimes: ', newStartTimes);
//                         // openGenAlert({ text: " כבר משבצים ... " })
//                         //! ^

//                     } catch (e) { console.log("error getting start times from result ", e); }
//                 } else {
//                     //failed
//                     console.log('ERROR result: ', result);
//                     openGenAlert({ text: " אירעה שגיאה, לא ניתן כעת להשתבץ לפגישה זו " })
//                 }
//             }
//         );
//     }, [])

//     let locationInfo;
//     return (
//         <div>
//             <Polyline
//                 path={state.lineCoordinates}
//                 geodesic={false}
//                 options={{ strokeColor: '#82C0CC', strokeOpacity: "62%", strokeOpacity: 1, strokeWeight: 7, }}
//             />
//             {places.map((place, i) => {
//                 locationInfo = { location: place.location, ...place.markerOptions }
//                 return <MarkerGenerator key={i} locationInfo={locationInfo} icon={place.icon || null} label={place.label || null} />
//             })}
//             {state && state.markerCenter && state.markerCenter.location && state.markerCenter.duration ?
//                 <MarkerGenerator locationInfo={{ location: state.markerCenter.location }} label={state.markerCenter.duration} /> : null}
//         </div>
//     );
// }

// export default MyMapDirectionsRenderer;

