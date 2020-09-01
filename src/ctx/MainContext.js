import React, { useState } from 'react';


export const MainContext = React.createContext()

export const MainProvider = ({ children }) => {
    //alerts START
    let alertTO = null;
    const [showAlert, setShowAlert] = useState(false)
    //alerts END

    const [userInfo, setUserInfo] = useState(null);

    const closeAlert = () => { setShowAlert(false) }
    const openGenAlertSync = async (obj) => {
        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        return await new Promise((resolve, reject) => {
            const popupCb = res => { resolve(res) }
            const alertObj = { text: obj.text, warning: obj.warning || false, block: obj.block || false, noTimeout: obj.noTimeout || false }
            if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
            setShowAlert(alertObj)
            if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 5000)
        })
    }
    const openGenAlert = (obj, popupCb = () => { }) => {
        if (typeof obj !== "object" || Array.isArray(obj)) return;
        clearTimeout(alertTO)
        const alertObj = { text: obj.text, warning: obj.warning || false, block: obj.block || false, noTimeout: obj.noTimeout || false }
        if (obj.isPopup) alertObj.isPopup = { ...obj.isPopup, popupCb, closeSelf: () => { setShowAlert(false) } }
        setShowAlert(alertObj)
        if (!obj.isPopup && !obj.noTimeout) alertTO = setTimeout(closeAlert, 5000)
    }

    const ctxValue = {
        openGenAlertSync, openGenAlert, showAlert,
        userInfo, setUserInfo
    }

    return <MainContext.Provider value={ctxValue} >
        {children}
    </MainContext.Provider>
}