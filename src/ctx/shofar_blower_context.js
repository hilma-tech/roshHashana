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
    const [startTimesToUpdate, setStartTimesToUpdate] = useState(null)


    useEffect(() => {
        if (startTimesToUpdate && Array.isArray(startTimesToUpdate) && startTimesToUpdate.length) {
            console.log('startTimesToUpdate: ', startTimesToUpdate);
            assignSB(startTimesToUpdate, (error, res) => {
                if (error || !res) openGenAlert({ text: error })
                else if (Array.isArray(res)) {
                    openGenAlert({ text: "חלק מהשיבוצים נכשלו" })
                }
                else openGenAlert({ text: "שובצת בהצלחה" })
            })
        }
        return () => {
            if (startTimesToUpdate && Array.isArray(startTimesToUpdate) && startTimesToUpdate.length) {
                assignSB(startTimesToUpdate, (error, res) => {
                    if (error || !res) openGenAlert({ text: error })
                    else if (Array.isArray(res)) {
                        openGenAlert({ text: "חלק מהשיבוצים נכשלו" })
                    }
                    else openGenAlert({ text: "שובצת בהצלחה" })
                })
            }
        }
    }, [startTimesToUpdate])


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
        startTimesToUpdate, setStartTimesToUpdate
    }

    return <SBContext.Provider value={ctxValue} >
        {children}
    </SBContext.Provider>
}