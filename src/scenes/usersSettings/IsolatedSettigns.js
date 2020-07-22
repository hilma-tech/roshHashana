import React, { useEffect, useState, useRef } from 'react';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import Auth from '../../modules/auth/Auth';
import Geocode from "react-geocode";
import './Settings.scss';

const IsolatedSettings = (props) => {

    const [isolatedInfo, setIsolatedInfo] = useState({});
    const [openPersInfo, setOpenPersInfo] = useState(false);
    const [openBlowingSet, setOpenBlowingSet] = useState(false);
    const [msgErr, setMsgErr] = useState('');

    useEffect(() => {
        (async () => {
            let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo?role=${1}`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            }, true);
            setIsolatedInfo(res);
            console.log(res)
        })();
    }, []);

    useEffect(() => {
        console.log(openPersInfo)
    }, [openPersInfo]);

    const updateIsolatedInfo = async () => {

        let name = document.getElementById('name');
        let username = document.getElementById('phone-number');
        let city = document.getElementById('city');
        let street = document.getElementById('street');
        let appartment = document.getElementById('appartment');
        let comments = document.getElementById('comments');
        let public_meeting = document.getElementById('public-meeting');
        let public_phone = document.getElementById('public-phone');


        if (!name.value) name = { value: isolatedInfo.name };
        if (!username.value) username = { value: isolatedInfo.username };
        if (username.value.includes('.')) { setMsgErr('מספר הפלאפון שהזנת אינו תקין'); return; }
        if (!city.value) city = { value: isolatedInfo.userCity.name };

        let address = city.value + ' ' + street.value + ' ' + appartment.value;
        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");
        await Geocode.fromAddress(address).then(
            async response => {
                let newData = {
                    "name": name,
                    "username": username,
                    "public_phone": public_phone.checked,
                    "city": city,
                    "street": street.value,
                    "appartment": appartment.value,
                    "comments": comments.value,
                    "public_meeting": public_meeting.checked ? 1 : 0
                }
                console.log('isolatedDetails', newData)
                setMsgErr('');

                //update isolated details
                //     let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo?role=${1}`, {
                //         headers: { Accept: "application/json", "Content-Type": "application/json" },
                //     }, true);
                //     if (res) {
                //         props.history.goBack();
                //     }
            },
            error => {
                setMsgErr('הכתובת אינה תקינה, אנא בדוק אותה');
                return;
            }
        );
    }

    return (
        <SettingsLayout handleClose={updateIsolatedInfo}>
            <div className="personal-info-btn clickAble" onClick={() => setOpenPersInfo(!openPersInfo)}>
                <div>פרטים אישיים</div>
                <div>{openPersInfo ? '-' : '+'}</div>
            </div>

            <div className="personal-info fade-in" style={{ display: openPersInfo ? 'block' : 'none' }}>
                <div className="header">שם מלא</div>
                <input autoComplete={'off'} id="name" type="text" placeholder={isolatedInfo.name} maxLength={20} />
                <div className="header">טלפון</div>
                <input autoComplete={'off'} id="phone-number" type="tel" placeholder={isolatedInfo.username} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} />
            </div>

            <div id="blowing-set-btn" className="clickAble" onClick={() => setOpenBlowingSet(!openBlowingSet)}>
                <div >הגדרות לתקיעה בשופר</div>
                <div>+</div>
            </div>

            <div id="blowing-set" className="fade-in" style={{ display: openBlowingSet ? 'block' : 'none' }}>
                <div className="header">כתובת</div>
                <input autoComplete={'off'} id="city" type="text" placeholder={isolatedInfo.userCity ? isolatedInfo.userCity.name : ''} />
                <input autoComplete={'off'} id="street" type="text" placeholder={isolatedInfo.street} />
                <input autoComplete={'off'} id="appartment" type="text" placeholder={isolatedInfo.appartment} />

                <div className="preferance header2">מהם העדפותיך לשמיעת תקיעת השופר?</div>
                <div className="checkbox-container ">
                    <div className="header">בפתח הבית</div>
                    <input className="clickAble" type="radio" name="preferance" defaultChecked={isolatedInfo.public_meeting ? false : true} />
                </div>

                <div className="checkbox-container ">
                    <div className="header">בחלון או במרפסת הפונה לרחוב</div>
                    <input id="public-meeting" className="clickAble" type="radio" name="preferance" defaultChecked={isolatedInfo.public_meeting ? true : false} />
                </div>

                <div className="header">הערות</div>
                <input autoComplete={'off'} id="comments" type="text" placeholder={isolatedInfo.comments} />

                <div className="checkbox-container approval header">
                    <div className="header2">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                    <input id="public-phone" className="clickAble" type="checkbox" checked={isolatedInfo.public_phone} ></input>
                </div>
            </div>
            <div className="err-msg">{msgErr}</div>
        </SettingsLayout>
    );
}
export default IsolatedSettings;