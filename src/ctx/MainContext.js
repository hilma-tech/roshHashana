import React, { useState } from 'react';


export const MainContext = React.createContext()

export const MainProvider = ({ children }) => {
    //alerts
    let alertTO = null;
    const [showAlert, setShowAlert] = useState(false)
    const [cities, setCities] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

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
        cities, setCities,
        userInfo, setUserInfo
    }

    return <MainContext.Provider value={ctxValue} >
        {children}
    </MainContext.Provider>
}