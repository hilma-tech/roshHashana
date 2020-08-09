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


    useEffect(() => {
        if (assigns && Array.isArray(assigns) && assigns.length && startTimes && typeof startTimes === "object") {

            const toAssign = []

            for (let i in assigns) {
                for (let j in startTimes) {
                    if (assigns[i].meetingId == startTimes[j].meetingId) {
                        toAssign.push({ meetingId: assigns[i].meetingId, isPublicMeeting: assigns[i].isPublicMeeting, startTime: startTimes[j].startTime })
                    }
                }
            }

            if (!assigning && toAssign && toAssign.length) {
                assigning = true
                assignSB(toAssign, (error, res) => {
                    setAssigns(null);
                    assigning = false
                    if (error || !res) openGenAlert({ text: error })
                    else if (Array.isArray(res)) {
                        let success = true
                        for (let i in res) {
                            if (!res[i] || !res[i].success) {
                                openGenAlert({ text: "חלק מהשיבוצים נכשלו" })
                                success = false
                                break;
                            }
                        }
                        if (success) {
                            openGenAlert({ text: "שובצת בהצלחה" })
                        }
                    }
                    else openGenAlert({ text: "שובצת בהצלחה" })
                })
            }
        }
    }, [assigns, startTimes])


    const closeAlert = () => { setShowAlert(false) }
    const openGenAlert = (obj, popupCb = () => { }) => {
        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        const alertObj = { text: obj.text, warning: obj.warning || false, noTimeout: obj.noTimeout || false }
        if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
        setShowAlert(alertObj)
        if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 5000)
    }



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