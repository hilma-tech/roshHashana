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

    const [assignMeetingInfo, setAssignMeetingInfo] = useState(null)
    const [assigns, setAssigns] = useState(null)
    const [startTimes, setStartTimes] = useState(null)
    const [totalTime, setTotalTime] = useState(null)
    const [totalLength, setTotalLength] = useState(null)

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
    

    const ctxValue =  {
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs,
        assignMeetingInfo, setAssignMeetingInfo,
        assigns, setAssigns,
        startTimes, setStartTimes,
        totalTime, totalLength,
    }

    return <SBContext.Provider value={ctxValue} >
        <>
            {children}
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>
    </SBContext.Provider>
}