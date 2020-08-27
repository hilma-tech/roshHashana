import React, { useState, useEffect } from 'react';
import { assignSB } from '../fetch_and_utils';
import GeneralAlert from '../components/modals/general_alert';

export const SBContext = React.createContext()

let assigning = false;
export const SBProvider = ({ children }) => {
    //alerts
    let alertTO = null;
    const [showAlert, setShowAlert] = useState(false)

    //sb meetings, reqs and user data
    const [userData, setUserData] = useState(null);
    const [myMeetings, setMyMeetings] = useState(null);
    const [meetingsReqs, setMeetingsReqs] = useState(null);
    const [isPrint, setIsPrint] = useState(false);

    const [assignMeetingInfo, setAssignMeetingInfo] = useState(null)
    const [assigns, setAssigns] = useState(null)
    const [startTimes, setStartTimes] = useState(null)
    const [totalTime, setTotalTime] = useState(null)
    const [totalLength, setTotalLength] = useState(null)
    const [isInRoute, setIsInRoute] = useState(false)

    const [genMapMeetings, setGenMapMeetings] = useState(null)

    const getLengthFromPrevStop = (meetingId, isPublicMeeting) => {
        let st = Array.isArray(startTimes) && startTimes.find(st => (st.meetingId == meetingId && st.isPublicMeeting == isPublicMeeting))
        return st && st.duration ? (typeof st.duration.text === "string" ? st.duration.text.split("mins").join("דקות").split("min").join("דקה") : st.duration.text) : null //google sometimes returns in english
    }

    const getTotalTime = () => {
        if (!Array.isArray(myMeetings) || !myMeetings.length) return null;
        const startTimeRoute = new Date(myMeetings[0].startTime).getTime()
        if (!startTimeRoute) return null
        const endTimeRoute = new Date(myMeetings[myMeetings.length - 1].startTime).getTime()
        if (!endTimeRoute) return null
        return endTimeRoute - startTimeRoute
    }
    const getTotalLength = () => {
        if (!startTimes) return null;
        return startTimes.reduce((accumulator, t) => accumulator + t.distance.value, 0);
    }
    useEffect(() => {
        if (startTimes) setTotalLength(getTotalLength())
        if (Array.isArray(myMeetings) && myMeetings.length) setTotalTime(getTotalTime())
    }, [startTimes, myMeetings])

    const ctxValue = window.sbctx = {
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs,
        assignMeetingInfo, setAssignMeetingInfo,
        genMapMeetings, setGenMapMeetings,
        assigns, setAssigns,
        startTimes, setStartTimes,
        isInRoute, setIsInRoute,
        totalTime, totalLength,
        getLengthFromPrevStop,
        isPrint, setIsPrint
    }

    return <SBContext.Provider value={ctxValue} >
        <>
            {children}
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>
    </SBContext.Provider>
}