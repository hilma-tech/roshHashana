import React, { useEffect, useState, Fragment, useContext } from 'react';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ThemeProvider } from "@material-ui/styles";
import { MainContext } from '../../ctx/MainContext';
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import Slider from '@material-ui/core/Slider';
import Auth from '../../modules/auth/Auth';
import MomentUtils from '@date-io/moment';
import Geocode from "react-geocode";
import './Settings.scss';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';

import AddPublicPlace from '../../components/addPublicPlace/AddPublicPlace';
import GeneralAlert from '../../components/modals/general_alert';
const materialTheme = createMuiTheme({
    overrides: {
        MuiPickersToolbar: {
            toolbar: {
                backgroundColor: "#16697a",
                direction: "ltr"
            },
        },
        MuiPickersTimePickerToolbar: {
            toolbarAmpmLeftPadding: {
                direction: "ltr"
            }
        },
    },
    palette: {
        primary: { main: "#16697a" }
    }
});

const format = 'HH:mm';


const IsolatedSettings = (props) => {

    const { openGenAlert, showAlert } = useContext(MainContext);
    const [publicMeetings, setPublicMeetings] = useState([])
    const [settingsType, setSettingsType] = useState('');
    const [blowingTimes, setBlowingTimes] = useState('');
    const [address, setAddress] = useState('');
    const [blowerInfo, setBlowerInfo] = useState({});
    const [startTime, setStartTime] = useState('');
    const [username, setUsername] = useState('');
    const [maxTime, setMaxTime] = useState('');
    const [msgErr, setMsgErr] = useState('');
    const [name, setName] = useState('');
    const [locationMsgErr, setLocationMsgErr] = useState('');
    const [blowingTimesMsgErr, setBlowingTimesMsgErr] = useState('');
    const [phoneMsgErr, setPhoneMsgErr] = useState('');
    const [nameMsgErr, setNameMsgErr] = useState('');

    useEffect(() => {
        (async () => {
            if (!Object.keys(blowerInfo).length) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                if (err || !res) { openGenAlert({ text: "אירעה שגיאה בעת הבאת המידע, נא נסו שנית מאוחר יותר, תודה" }); console.log("getUserInfo err ", err, " or that !res"); return }
                setValues(res, setBlowerInfo);
                setValues(res.name, setName);
                setValues(res.address, setAddress);
                setValues(res.username, setUsername);
                setValues(res.volunteering_start_time, setStartTime);
                setValues(res.volunteering_max_time, setMaxTime);
                setValues(res.can_blow_x_times, setBlowingTimes);
                setValues(res.publicMeetings, setPublicMeetings);
            }
        })();
    }, []);


    //a function that handles set state generically
    const setValues = (val, setFunc) => {
        setFunc(val);
    }

    const addPublicPlace = () => {
        if (publicMeetings.length < 4) {
            let publicPlaces = publicMeetings;
            publicPlaces.push({});
            setPublicMeetings([...publicPlaces]);
            setMsgErr('');

        }
        else setMsgErr('לא ניתן להוסיף עוד תקיעות ציבוריות ');
    }
    const changeSettingsType = (e) => {
        if (e.target.id === settingsType) {
            setSettingsType('');
        }
        else setSettingsType(e.target.id);
    }
    const changeSettingsTypeWithParameter = (newSettingsType) => {
        if (newSettingsType === settingsType) {
            setSettingsType('');
        }
        else {
            setTimeout(() => {
                setSettingsType(newSettingsType)
            }, 0);
        };
    }


    const removePubPlace = (i) => {
        let publicPlaces = [...publicMeetings];
        publicPlaces.splice(i, 1);
        setPublicMeetings(publicPlaces)
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
        // /^[a-z\u0590-\u05fe]+$/i
        let nameVal = name;
        let usernameVal = username;
        let startTimeVal = startTime;
        let blowingTimesVal = blowingTimes;
        let maxTimeVal = maxTime;
        if (blowingTimes < 0) {
            openGenAlert({ text: 'מספר הפעמים שתוכל לתקוע לא יכול להיות שלילי' });
            setBlowingTimesMsgErr('מספר הפעמים שתוכל לתקוע לא יכול להיות שלילי'); return;
        }
        if (blowingTimes > 20) {
            openGenAlert({ text: 'לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים' });
            setBlowingTimesMsgErr('לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים'); return;
        }
        if (!nameVal) nameVal = blowerInfo.name;
        if (usernameVal[0] != 0) {
            openGenAlert({ text: 'מספר הפלאפון שהזנת אינו תקין' });
            setPhoneMsgErr('מספר הפלאפון שהזנת אינו תקין');
            return;
        }
        if (!usernameVal) usernameVal = blowerInfo.username;
        if (address === "NOT_A_VALID_ADDRESS") {
            openGenAlert({ text: "הכתובת שהזנת אינה תקינה" })
            setLocationMsgErr('הכתובת שהזנת אינה תקינה'); return;
        }
        for (let i = 0; i < publicMeetings.length; i++) {
            if (publicMeetings[i].address === "NOT_A_VALID_ADDRESS") {
                let publicPlaces = publicMeetings;
                publicPlaces[i].errMsg = "הכתובת שהזנת אינה תקינה";
                setPublicMeetings(publicPlaces)
                openGenAlert({ text: "הכתובת שהזנת אינה תקינה" })
                return
            }
        }

        if (!/^[A-Zא-תa-z '"-]{2,}$/.test(nameVal) || usernameVal.length !== 10) {
            openGenAlert({ text: 'השם שהזנת אינו תקין' })
            setNameMsgErr('השם שהזנת אינו תקין');
            return;
        }

        if (!maxTimeVal) maxTimeVal = blowerInfo.volunteering_max_time;
        if (!blowingTimesVal) blowingTimesVal = blowerInfo.can_blow_x_times;
        if (!startTimeVal) startTimeVal = blowerInfo.volunteering_start_time;

        Geocode.setApiKey(process.env.REACT_APP_GOOGLE_KEY);
        Geocode.setLanguage("he");
        await Geocode.fromAddress(address).then(
            async response => {
                let newData = {
                    "name": nameVal,
                    "username": usernameVal,
                    "address": address,
                    "volunteering_max_time": maxTimeVal,
                    "can_blow_x_times": blowingTimesVal,
                    "volunteering_start_time": startTimeVal,
                    "publicMeetings": publicMeetings
                }
                setMsgErr('');
                //update isolated details
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "PUT",
                    body: JSON.stringify({ "data": newData })
                }, true);
                if (res) {
                    props.history.goBack();
                }
            },
            error => {
                setMsgErr('הכתובת אינה תקינה, אנא בדוק אותה');
                return;
            }
        );
    }
    const updatePublicPlace = (index, keyName, publicPlaceVal) => {
        let publicPlaces = publicMeetings;
        publicPlaces[index][keyName] = publicPlaceVal;
        setPublicMeetings(publicPlaces)
    }

    return (
        <>
            <SettingsLayout handleClose={updateIsolatedInfo}>
                <div id="personal-info" className="personal-info-btn clickAble" onClick={changeSettingsType}>
                    <div onClick={() => { changeSettingsTypeWithParameter('personal-info') }} className="noSelect">פרטים אישיים</div>
                    <div onClick={() => { changeSettingsTypeWithParameter('personal-info') }}
                        className="noSelect">{settingsType === 'personal-info' ? '-' : '+'}</div>
                </div>

                <div className="personal-info fade-in" style={{ display: settingsType === 'personal-info' ? 'block' : 'none' }}>

                    <div className="header">שם מלא</div>
                    <input autoComplete={'off'} id="name" type="text" value={name} onChange={(e) => setValues(e.target.value, setName)} maxLength={20} />
                    <div className="err-msg">{nameMsgErr}</div>
                    <div style={{ marginTop: "5%" }} className="header">טלפון</div>
                    <input autoComplete={'off'} id="phone-number" type="tel" value={username} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} />
                    <div className="err-msg">{phoneMsgErr}</div>
                </div>

                <div id="blowing-set-btn" className="clickAble" onClick={changeSettingsType}>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('blowing-set-btn')}>הגדרות מפת התקיעות</div>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('blowing-set-btn')}>{settingsType === 'blowing-set-btn' ? '-' : '+'}</div>
                </div>

                <div id="blowing-set" className="fade-in" style={{ display: settingsType === 'blowing-set-btn' ? 'block' : 'none' }}>

                    <div className="header">כמה פעמים תוכל לתקוע?</div>
                    <input id="blowingTimes" type="number" value={blowingTimes} maxLength={2} onChange={(e) => setValues(e.target.value, setBlowingTimes)} />
                    <div className="err-msg">{blowingTimesMsgErr}</div>

                    <div style={{ marginTop: "5%" }} className="header">שעת יציאה</div>
                    <ThemeProvider theme={materialTheme}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <Fragment>
                                <TimePicker
                                    ampm={false}
                                    value={startTime}
                                    onChange={(time) => setValues(time._d, setStartTime)}
                                    format={format}
                                />
                            </Fragment>
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>

                    <div className="header">כתובת יציאה</div>

                    <FormSearchBoxGenerator value={address} onAddressChange={handleAddressChange} uId='address' defaultValue={address} />
                    <div className="err-msg" style={{ marginBottom: "1rem" }}>{locationMsgErr}</div>

                    <div style={{ marginTop: "5%" }} className="max-time header">סמן את זמן ההליכה</div>
                    <Slider value={maxTime ? maxTime : 0} min={15} max={180} onChange={(e, val) => setValues(val, setMaxTime)} aria-labelledby="continuous-slider" />
                    <div className="max-time-val">{`עד ${maxTime} דקות`}</div>
                </div>

                <div id="public-blowing-set-btn" className="clickAble" onClick={changeSettingsType}>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('public-blowing-set-btn')}>תקיעות ציבוריות</div>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('public-blowing-set-btn')}>{settingsType === 'public-blowing-set-btn' ? '-' : '+'}</div>
                </div>

                <div id="public-blowing-set" className="fade-in" style={{ display: settingsType === 'public-blowing-set-btn' ? 'block' : 'none' }}>
                    {publicMeetings && publicMeetings.map((place, index) => {
                        return <div key={index}><AddPublicPlace
                            removePubPlace={removePubPlace}
                            index={index}
                            format={format}
                            updatePublicPlace={updatePublicPlace}
                            inSettings={true}
                            info={place ? place : undefined}
                        /><hr style={{ marginBottom: "5%" }} /></div>
                    })}
                    <div id="add-public-place" className="clickAble" onClick={addPublicPlace}>
                        <div id="plus">+</div>
                        <div>הוסף תקיעה במקום ציבורי</div>
                    </div>
                </div>
                <div className="err-msg">{msgErr}</div>
            </SettingsLayout >
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}

        </>
    );
}
export default IsolatedSettings;