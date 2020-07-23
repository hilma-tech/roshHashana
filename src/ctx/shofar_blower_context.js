import React, { useState } from 'react';


export const SBContext = React.createContext()

export const SBProvider = ({ children }) => {
    //alerts
    let alertTO = null;
    const [showAlert, setShowAlert] = useState(false)

    //sb meetings, reqs and user data
    const [userData, setUserData] = useState(null);
    const [myMeetings, setMyMeetings] = useState(null);
    const [meetingsReqs, setMeetingsReqs] = useState(null);


    const closeAlert = () => { setShowAlert(false) }
    const openGenAlert = (obj, popupCb = () => { }) => {
        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        const alertObj = { text: obj.text, warning: obj.warning || false, noTimeout: obj.noTimeout || false }
        if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
        setShowAlert(alertObj)
        if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 5000)

    }

    const ctxValue = {
        openGenAlert, showAlert,
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs,
    }

    return <SBContext.Provider value={ctxValue} >
        {children}
    </SBContext.Provider>
}