import React from 'react'
import Auth from '../../modules/auth/Auth';
import './SettingsLayout.scss';
import { isBrowser } from "react-device-detect";

//this component excepts to get settings content
//props: 
//      handleClose -> a function that handles when the user clicks on x
//      children- it is not a prop, it is the content that inside <Settings> content </Settings>
const Settings = (props) => {

    const handleClose = () => {
        if (props.handleClose) props.handleClose();
        else props.history.goBack();
    }
    const logOut = () => {
        window.location.href = window.location.origin
    }

    return (
        <div>
            <div style={{ width: isBrowser ? "36%" : "100%", right: isBrowser ? "0" : "none", left: isBrowser ? "none" : "0" }} id="settings-container" className="fade-in">
                <img id="close" alt="" className="clickAble" src="/icons/close.svg" onClick={handleClose} />
                <div className="save-button" onClick={props.handleUpdate} > עדכן</div>
                <div id="content-container">
                    <div id="title">הגדרות</div>
                    <div id="settigns-content">{props.children}</div>
                    <div id="log-out" className="clickAble" onClick={() => Auth.logout(logOut)} >התנתק</div>

                </div>
            </div>
            {<img className="shofarBackground" src="images/shoparForStartCrop.png" />}
        </div >
    );
}
export default Settings;