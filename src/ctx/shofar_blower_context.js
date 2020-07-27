import React, { useState, useEffect } from 'react';
import { assignSB } from '../fetch_and_utils';

export const SBContext = React.createContext()

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


    useEffect(() => {
        console.log('ctx useEffect for assigns and for startTimes');
        if (assigns && Array.isArray(assigns) && assigns.length && startTimes && typeof startTimes === "object") {
            console.log('assigns: ', assigns);
            console.log('startTimes: ', startTimes);

            const toAssign = []

            for (let i in assigns) {
                for (let j in startTimes) {
                    if (assigns[i].meetingId == startTimes[j].meetingId) {
                        toAssign.push({ meetingId: assigns[i].meetingId, isPublicMeeting: assigns[i].isPublicMeeting, startTime: startTimes[j].startTime })
                    }
                }
            }

            if (toAssign && toAssign.length)
                assignSB(toAssign, (error, res) => {
                    setAssigns(null);
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



    const ctxValue = window.sbctx = {
        openGenAlert, showAlert,
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs,
        assignMeetingInfo, setAssignMeetingInfo,
        assigns, setAssigns,
        startTimes, setStartTimes
    }

    return <SBContext.Provider value={ctxValue} >
        {children}
    </SBContext.Provider>
}