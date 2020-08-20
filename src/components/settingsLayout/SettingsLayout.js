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
            <div style={{ width: isBrowser ? "40%" : "100%", right: isBrowser ? "0" : "none", left: isBrowser ? "none" : "0" }} id="settings-container" className="fade-in">
                <img id="close" alt="" className="clickAble" src="/icons/close.svg" onClick={handleClose} />
                {props.disabled ? null : <div className="save-button" onClick={() => { !props.disabled && props.handleUpdate() }} > עדכן</div>}
                <div id="content-container">
                    <div id="title">הגדרות</div>
                    {props.disabled ? <div>מועד התקיעה מתקרב, לא ניתן יותר לערוך את הפרטים</div> : null}
                    <div id="settigns-content">{props.children}</div>
                    <div id="log-out" className="clickAble" onClick={() => Auth.logout(logOut)} >התנתק</div>

                </div>
            </div>
            {isBrowser && props.map}
        </div >
    );
}
export default Settings;