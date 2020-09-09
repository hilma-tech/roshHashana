import React, { useState } from 'react';
import GeneralAlert from '../components/modals/general_alert';


export const MainContext = React.createContext()

export const MainProvider = ({ children }) => {
    //alerts START
    let alertTO = null;
    const [showAlert, setShowAlert] = useState(false)
    //alerts END

    const [center, setCenter] = useState(null); //for maps
    const [defaultCenter, setDefaultCenter] = useState(null); //for maps

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
        userInfo, setUserInfo,
        center, setCenter,
        defaultCenter, setDefaultCenter
    }

    return <MainContext.Provider value={ctxValue} >
        {children}
        {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
    </MainContext.Provider>
}