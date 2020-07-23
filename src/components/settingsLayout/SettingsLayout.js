import React from 'react'
import Auth from '../../modules/auth/Auth';
import './SettingsLayout.scss';

//this component excepts to get settings content
const Settings = (props) => {

    const handleClose = () => {
        if (props.handleClose) props.handleClose();
        else props.history.goBack();
    }
    const logOut = () => {
        window.location.href = window.location.origin
      }

    return (
        <div id="settings-container" className="fade-in">
            <img id="close" className="clickAble" src="/icons/close.svg" onClick={handleClose} />
            <div id="content-container">
                <div id="title">הגדרות</div>
                <div id="settigns-content">{props.children}</div>
                <div id="log-out" className="clickAble" onClick={() => Auth.logout(logOut)} >התנתק</div>
            </div>
        </div>
    );
}
export default Settings;