import React from 'react'
import Auth from '../../modules/auth/Auth';
import './SettingsLayout.scss';

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
        <div id="settings-container" className="fade-in">
            <img id="close" alt="" className="clickAble" src="/icons/close.svg" onClick={handleClose} />
            <div id="content-container">
                <div id="title">הגדרות</div>
                <div id="settigns-content">{props.children}</div>
                <div id="log-out" className="clickAble" onClick={() => Auth.logout(logOut)} >התנתק</div>
            </div>
        </div>
    );
}
export default Settings;