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
    const [comments, setComments] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [city, setCity] = useState('');
    const [street, setStreet] = useState('');
    const [appartment, setAppartment] = useState('');


    useEffect(() => {
        (async () => {
            if (!Object.keys(isolatedInfo).length) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo?role=${1}`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                setValues(res, setIsolatedInfo);
                setValues(res.comments ? res.comments : '', setComments);
                setValues(res.name, setName);
                setValues(res.userCity ? res.userCity.name : '', setCity);
                setValues(res.street, setStreet);
                setValues(res.appartment, setAppartment);
                setValues(res.username, setUsername);
            }
        })();
    }, []);

    //a function that handles set state generically
    const setValues = (val, setFunc) => {
        setFunc(val);
    }

    const updateIsolatedInfo = async () => {

        let nameVal = name;
        let usernameVal = username;
        let cityVal = city;
        let streetVal = street;
        let appartmentVal = appartment;
        let public_meeting = document.getElementById('public-meeting');
        let public_phone = document.getElementById('public-phone');

        if (!nameVal) nameVal = isolatedInfo.name;
        if (!usernameVal) usernameVal = isolatedInfo.username;
        if (usernameVal.includes('.')) { setMsgErr('מספר הפלאפון שהזנת אינו תקין'); return; }
        if (!streetVal && !appartmentVal && !comments) {
            setMsgErr('אנא הכנס או שם רחוב ומספר בית או הערות המתארות את מקום מגוריך');
            return;
        }

        if (!cityVal) cityVal = isolatedInfo.userCity ? isolatedInfo.userCity.name : '';
        if (!streetVal) streetVal = isolatedInfo.street;
        if (!appartmentVal) appartmentVal = isolatedInfo.appartment;

        let address = cityVal + ' ' + streetVal + ' ' + appartmentVal;
        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");
        await Geocode.fromAddress(address).then(
            async response => {
                let newData = {
                    "name": nameVal,
                    "username": usernameVal,
                    "public_phone": public_phone.checked,
                    "city": cityVal,
                    "street": streetVal,
                    "appartment": appartmentVal,
                    "comments": comments,
                    "public_meeting": public_meeting.checked ? 1 : 0
                }
                setMsgErr('');
                //update isolated details
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "PUT",
                    body: JSON.stringify({ "role": 1, "data": newData })
                }, true);
                if (res) {
                    props.history.push('/', { name: nameVal, address });
                }
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
                <input autoComplete={'off'} id="name" type="text" value={name} onChange={(e) => setValues(e.target.value, setName)} maxLength={20} />
                <div className="header">טלפון</div>
                <input autoComplete={'off'} id="phone-number" type="tel" value={username} onChange={(e) => setValues(e.target.value, setUsername)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} />
            </div>

            <div id="blowing-set-btn" className="clickAble" onClick={() => setOpenBlowingSet(!openBlowingSet)}>
                <div >הגדרות לתקיעה בשופר</div>
                <div>{openPersInfo ? '-' : '+'}</div>
            </div>

            <div id="blowing-set" className="fade-in" style={{ display: openBlowingSet ? 'block' : 'none' }}>
                <div className="header">כתובת</div>
                <input autoComplete={'off'} id="city" type="text" value={city} placeholder="עיר / יישוב" onChange={(e) => setValues(e.target.value, setCity)} />
                <input autoComplete={'off'} id="street" type="text" value={street} placeholder="רחוב" onChange={(e) => setValues(e.target.value, setStreet)} />
                <input autoComplete={'off'} id="appartment" type="text" value={appartment} placeholder="מספר בית / דירה" onChange={(e) => setValues(e.target.value, setAppartment)} />

                <div className="preferance header2">מהם העדפותיך לשמיעת תקיעת השופר?</div>
                <div className="checkbox-container ">
                    <div className="header">בפתח הבית</div>
                    <input className="clickAble" type="radio" name="preferance" defaultChecked={isolatedInfo.public_meeting ? false : true} />
                </div>

                <div className="checkbox-container ">
                    <div className="header">בחלון או במרפסת הפונה לרחוב</div>
                    <input id="public-meeting" className="clickAble" type="radio" name="preferance" defaultChecked={isolatedInfo.public_meeting ? true : false} />
                </div>

                <div className="header">הערות ותיאור הכתובת</div>
                <input autoComplete={'off'} id="comments" type="text" placeholder={comments} value={comments} onChange={(e) => setValues(e.target.value, setComments)} />

                <div className="checkbox-container approval header">
                    <div className="header2">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                    <input id="public-phone" className="clickAble" type="checkbox" defaultChecked={isolatedInfo.public_phone} ></input>
                </div>
            </div>
            <div className="err-msg">{msgErr}</div>
        </SettingsLayout>
    );
}
export default IsolatedSettings;