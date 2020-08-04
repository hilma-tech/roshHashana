import React, { useEffect, useState, useContext } from 'react';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import Auth from '../../modules/auth/Auth';
import Geocode from "react-geocode";
import './Settings.scss';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import { MainContext } from '../../ctx/MainContext';
import GeneralAlert from '../../components/modals/general_alert';

const IsolatedSettings = (props) => {
    const { openGenAlert, showAlert } = useContext(MainContext);

    const [openBlowingSet, setOpenBlowingSet] = useState(false);
    const [openPersInfo, setOpenPersInfo] = useState(false);
    const [isolatedInfo, setIsolatedInfo] = useState({});
    const [comments, setComments] = useState('');
    const [username, setUsername] = useState('');
    const [msgErr, setMsgErr] = useState('');
    const [locationMsgErr, setLocationMsgErr] = useState('');
    const [phoneMsgErr, setPhoneMsgErr] = useState('');
    const [nameMsgErr, setNameMsgErr] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');


    useEffect(() => {
        (async () => {
            if (!isolatedInfo || !Object.keys(isolatedInfo).length) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                setValues(res, setIsolatedInfo);
                setValues(res.comments ? res.comments : '', setComments);
                setValues(res.name, setName);
                setValues(res.username, setUsername);
                setValues(res.address, setAddress);

            }

        })();
    }, []);


    //a function that handles set state generically
    const setValues = (val, setFunc) => {
        setFunc(val);
    }


    const handlePhoneChange = (e) => {
        if (!isNaN(e.target.value) && e.target.value != "." && e.target.value != "-" && e.target.value != "+" && e.target.value != "e") {
            setValues(e.target.value, setUsername);
        }
    }
    const handleAddressChange = (placeName) => {
        setAddress(placeName)
    }
    const updateIsolatedInfo = async () => {

        let nameVal = name;
        let usernameVal = username;
        let public_meeting = document.getElementById('public-meeting');
        let public_phone = document.getElementById('public-phone');

        if (!nameVal) nameVal = isolatedInfo.name;
        if (!usernameVal) usernameVal = isolatedInfo.username;

        if (!/^[A-Zא-תa-z '"-]{2,}$/.test(nameVal) || usernameVal.length !== 10) {
            openGenAlert({ text: 'השם שהזנת אינו תקין' })
            setNameMsgErr('השם שהזנת אינו תקין');
            return;
        }

        if (usernameVal[0] != 0) {
            openGenAlert({ text: 'מספר הפלאפון שהזנת אינו תקין' });
            setPhoneMsgErr('מספר הפלאפון שהזנת אינו תקין');
            return;
        }
        if (address === "NOT_A_VALID_ADDRESS") {
            openGenAlert({ text: "הכתובת שהזנת אינה תקינה" })
            setLocationMsgErr('הכתובת שהזנת אינה תקינה'); return;
        }


        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");
        await Geocode.fromAddress(address).then(
            async response => {
                let newData = {
                    "name": nameVal,
                    "username": usernameVal,
                    "public_phone": public_phone.checked,
                    "address": address,
                    "comments": comments,
                    "public_meeting": public_meeting.checked ? 1 : 0
                }
                setMsgErr('');
                //update isolated details
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "PUT",
                    body: JSON.stringify({ "data": newData })
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
        <>
            <SettingsLayout handleClose={updateIsolatedInfo}>
                <div className="personal-info-btn clickAble" onClick={() => setOpenPersInfo(!openPersInfo)}>
                    <div>פרטים אישיים</div>
                    <div>{openPersInfo ? '-' : '+'}</div>
                </div>

                <div className="personal-info fade-in" style={{ display: openPersInfo ? 'block' : 'none' }}>
                    <div className="header">שם מלא</div>
                    <input autoComplete={'off'} id="name" type="text" value={name} onChange={(e) => setValues(e.target.value, setName)} maxLength={20} />
                    <div className="err-msg">{nameMsgErr}</div>

                    <div style={{ marginTop: "5%" }} className="header">טלפון</div>
                    <input autoComplete={'off'} id="phone-number" type="tel" value={username} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} />
                    <div className="err-msg">{phoneMsgErr}</div>

                </div>

                <div id="blowing-set-btn" className="clickAble" onClick={() => setOpenBlowingSet(!openBlowingSet)}>
                    <div >הגדרות לתקיעה בשופר</div>
                    <div>{openPersInfo ? '-' : '+'}</div>
                </div>

                <div id="blowing-set" className="fade-in" style={{ display: openBlowingSet ? 'block' : 'none' }}>
                    <div className="header">כתובת</div>
                    <FormSearchBoxGenerator value={address} onAddressChange={handleAddressChange} uId="publicPlaces-form-search-input-1" className='address' defaultValue={address} />
                    <div className="err-msg">{locationMsgErr}</div>

                    <div style={{ marginTop: "5%" }} className="preferance header2">מהם העדפותיך לשמיעת תקיעת השופר?</div>
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
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>

    );
}
export default IsolatedSettings;