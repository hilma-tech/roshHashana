import React, { useState, useEffect, useContext } from 'react'

import { SBContext } from '../../ctx/shofar_blower_context';

import { Polyline } from "react-google-maps";
import MarkerGenerator from './marker_generator';
import { observerBatching } from 'mobx-react';


const SHOFAR_BLOWER = 'shofar_blower';
const SHOFAR_BLOWING_PUBLIC = 'shofar_blowing_public';
const PRIVATE_MEETING = 'private meeting';


const MyMapDirectionsRenderer = (props) => {
    const { openGenAlert,
        userData, myMeetings, setMyMeetings,
        startTimesToUpdate, setStartTimesToUpdate } = useContext(SBContext)
    const [state, setState] = useState({
        lineCoordinates: null,
        markerCenter: null
    });
    const { places } = props; // [{ location: {}, isPublic: t/f,  }, { location: {} }]

    useEffect(() => {
        console.log('places: ', places);
        const travelMode = window.google.maps.TravelMode.WALKING
        const waypoints = places.map(p => ({
            location: p.location,
            stopover: true
        }))
        const origin = waypoints.shift().location;
        const destination = waypoints.length ? waypoints.pop().location : null;

        const directionsService = new window.google.maps.DirectionsService();
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
                if (status === window.google.maps.DirectionsStatus.OK) {
                    //OK
                    try {
                        const overViewCoords = result.routes[0].overview_path;
                        const centerL = overViewCoords[Math.floor(overViewCoords.length / 2)]
                        setState(state => ({ ...state, lineCoordinates: overViewCoords, markerCenter: { location: { lng: centerL.lng(), lat: centerL.lat() }, duration: result.routes[0].legs[0].duration.text } }));
                    } catch (e) { console.log("error getting overview path from DirectionsService() result", e) }
                    try {
                        console.log('origin: ', origin);
                        console.log('userData: ', userData);
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
                                newStartTimes.push({ meetingId: end_place.meetingId, isPublicMeeting: end_place.type = PRIVATE_MEETING ? false : true, startTime: leg_time })
                                continue
                            }
                            console.log('start_place && start_place.startTime: ', start_place && start_place.startTime);
                            if (start_place && start_place.startTime) {
                                leg_time = new Date(start_place.startTime).getTime() + leg.duration.value
                                console.log('calculated with prev stop: leg_time (mins): ', leg_time % 60000);
                                newStartTimes.push({ meetingId: end_place.meetingId, isPublicMeeting: end_place.type = PRIVATE_MEETING ? false : true, startTime: leg_time })
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
                    openGenAlert({ text: " אירעה שגיאה, לא ניתן כעת להשתבץ לפגישה זו " })
                }
            }
        );
    }, [])

    let locationInfo;
    return (
        <div>
            <Polyline
                path={state.lineCoordinates}
                geodesic={false}
                options={{ strokeColor: '#82C0CC', strokeOpacity: "62%", strokeOpacity: 1, strokeWeight: 7, }}
            />
            {places.map((place, i) => {
                locationInfo = { location: place.location, ...place.markerOptions }
                return <MarkerGenerator key={i} locationInfo={locationInfo} icon={place.icon || null} label={place.label || null} />
            })}
            {state && state.markerCenter && state.markerCenter.location && state.markerCenter.duration ?
                <MarkerGenerator locationInfo={{ location: state.markerCenter.location }} label={state.markerCenter.duration} /> : null}
        </div>
    );
}

export default MyMapDirectionsRenderer;

