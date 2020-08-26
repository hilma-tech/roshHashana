import React, { useRef, useEffect, useState, Fragment, useContext } from 'react';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import AddPublicPlace from '../../components/addPublicPlace/AddPublicPlace';
import GeneralAlert from '../../components/modals/general_alert';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { checkDateBlock } from '../../fetch_and_utils';
import { CONSTS } from '../../consts/const_messages';
import { MainContext } from '../../ctx/MainContext';
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { TimePicker } from '@material-ui/pickers';
import Slider from '@material-ui/core/Slider';
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import MomentUtils from '@date-io/moment';
import './Settings.scss';

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

let publicMeetingsChanged = false;
const IsolatedSettings = (props) => {

    const { openGenAlert, showAlert } = useContext(MainContext);
    const [settingsType, setSettingsType] = useState('');

    const [originalVals, setOriginalVals] = useState({});
    const [vals, setVals] = useState({});
    const [errs, setErrs] = useState({});

    useEffect(() => {
        (async () => {
            if (!vals || typeof vals !== "object" || !Object.keys(vals).length) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                if (err || !res) { openGenAlert({ text: "אירעה שגיאה בעת הבאת המידע, נא נסו שנית מאוחר יותר, תודה" }); console.log("getUserInfo err ", err, " or that !res"); return }
                setVals(res);
                setOriginalVals(res)
                publicMeetingsChanged = false;

            }
        })();
    }, []);


    //a function that handles set state generically
    const setValues = (val, valName) => {
        setVals(vals => ({ ...vals, [valName]: val }));
    }
    const setMsgErr = (msg, valName = "general") => {
        setErrs(errs => ({ ...errs, [valName]: msg }))
    }

    const addPublicPlace = () => {
        publicMeetingsChanged = true
        let publicMeetings = Array.isArray(vals.publicMeetings) ? [...vals.publicMeetings] : []
        if (publicMeetings.length < 4) {
            publicMeetings.push({ id: vals.publicMeetings.length });
            setValues(publicMeetings, "publicMeetings");
            if (errs.general && errs.general.length) setMsgErr(' ')
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
        publicMeetingsChanged = true
        let publicPlaces = [...vals.publicMeetings];
        publicPlaces.splice(i, 1);
        setValues(publicPlaces, 'publicMeetings')
    }
    const handlePhoneChange = (e) => {
        if (!isNaN(e.target.value) && e.target.value != "." && e.target.value != "-" && e.target.value != "+" && e.target.value != "e") {
            setValues(e.target.value, "username");
        }
    }
    const handleAddressChange = (placeName) => {
        setValues(placeName, 'address')
    }


    const updateBlowerInfo = async (fromX) => {
        if (!fromX && checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את הפרטים', block: true });
            setVals(originalVals)
            return;
        }

        //filter out unchanged values
        const updateData = {};
        for (let field in { ...vals }) { // remove values that are as origin
            if ((field === "publicMeetings" && publicMeetingsChanged) || vals[field] !== originalVals[field]) {
                updateData[field] = typeof vals[field] === "string" ? vals[field].trim() : vals[field]
            }
        }
        if (fromX) {
            if (publicMeetingsChanged || (updateData && Object.keys(updateData).length !== 0)) {
                openGenAlert({
                    text: `האם אתה בטוח שברצונך לצאת? \n השינויים שביצעת לא ישמרו`,
                    isPopup: { okayText: "צא", cancelText: "המשך לערוך" }
                },
                    (res) => {
                        if (res) {
                            props.history.goBack();
                            return
                        } else {
                            return
                        }
                    })
                return
            } else {
                props.history.goBack();
                return

            }
        }
        if (!Object.keys(updateData) || !Object.keys(updateData).length) {
            openGenAlert({
                text: "נשמר בהצלחה",
                isPopup: { okayText: "אישור" }
            },
                (res) => {
                    if (res)
                        props.history.goBack();
                })
            return;
        }

        let { name, username, volunteering_start_time, can_blow_x_times, volunteering_max_time, address, publicMeetings } = updateData;
        // validate values
        if (can_blow_x_times < 0) {
            openGenAlert({ text: 'מספר הפעמים שתוכל לתקוע לא יכול להיות שלילי' });
            setErrs(errs => ({ ...errs, can_blow_x_times: 'מספר הפעמים שתוכל לתקוע לא יכול להיות שלילי' }));
            return;
        }
        if (can_blow_x_times > 20) {
            openGenAlert({ text: 'לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים' });
            setErrs(errs => ({ ...errs, can_blow_x_times: 'לא ניתן לבצע תקיעת שופר יותר מ-20 פעמים' }));
            return;
        }
        if (username && (username[0] != 0 || username.length !== 10)) { setMsgErr('מספר הפלאפון שהזנת אינו תקין', "username"); return; }
        if (address) {
            if (!Array.isArray(address) || !address.length) {
                openGenAlert({ text: "הכתובת שהזנת אינה תקינה" })
                setErrs(errs => ({ ...errs, general: 'הכתובת שהזנת אינה תקינה' }));
                return;
            }
            else if (!address[0] || address[0] === CONSTS.NOT_A_VALID_ADDRESS || typeof address[1] !== "object" || !address[1].lng || !address[1].lat) {
                openGenAlert({ text: CONSTS.PICK_FROM_LIST_ADDRESS_MSG_ERROR })
                setErrs(errs => ({ ...errs, general: CONSTS.PICK_FROM_LIST_ADDRESS_MSG_ERROR }));
                return;
            }
        }
        if (publicMeetings && Array.isArray(publicMeetings) && publicMeetings.length > 0) {
            for (let i = 0; i < publicMeetings.length; i++) {
                if (!publicMeetings[i].time) {
                    openGenAlert({ text: "נא לציין את שעת התקיעה" })
                    setErrs(errs => ({ ...errs, general: "נא לציין את שעת התקיעה" }))
                    return;
                }
                if (publicMeetings[i].comments && publicMeetings[i].comments.length && !/^[A-Zא-תa-z0-9 '"-]{2,}$/.test(publicMeetings[i].comments)) {
                    let pms = [...publicMeetings];
                    pms[i].errMsg = 'לא ניתן להכניס תווים מיוחדים בתיאור';
                    setValues(pms, "publicMeetings")
                    openGenAlert({ text: 'לא ניתן להכניס תווים מיוחדים בתיאור' })
                    return
                }
                if (publicMeetings[i].address.length !== 2 || publicMeetings[i].address[0] === CONSTS.NOT_A_VALID_ADDRESS || !publicMeetings[i].address[1] || !publicMeetings[i].address[1].lng || !publicMeetings[i].address[1].lat) {
                    let pms = [...publicMeetings];
                    pms[i].errMsg = CONSTS.PICK_FROM_LIST_ADDRESS_MSG_ERROR;
                    setValues(pms, "publicMeetings")
                    openGenAlert({ text: CONSTS.PICK_FROM_LIST_ADDRESS_MSG_ERROR })
                    return
                }
            }
        }


        if (!/^[A-Zא-תa-z 0-9 '"-]{2,}$/.test(name)) { setMsgErr('השם שהזנת אינו תקין', "name"); return; }

        setErrs({}); //all

        //update blower details
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify({ data: updateData })
        }, true);
        if (err || !res) {
            openGenAlert({ text: err && err.error && err.error.message === "PHONE_EXISTS" ? "מספר הטלפון בשימוש" : "חלה תקלה, לא ניתן לעדכן כעת. נסו שוב מאוחר יותר." })
        }
        else {
            if (res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את הפרטים' });
                setVals(originalVals)
                return;
            }
            openGenAlert({
                text: "נשמר בהצלחה",
                isPopup: { okayText: "אישור" }
            },
                (res) => {
                    if (res)
                        props.history.goBack();
                })
        }
    }

    const updatePublicPlace = (index, keyName, publicPlaceVal) => {
        let value;
        if (keyName === 'time') {
            value = new Date(publicPlaceVal);
            value.setFullYear(2020, 8, 20);
        } else value = publicPlaceVal;
        publicMeetingsChanged = true
        let publicPlaces = vals.publicMeetings;
        publicPlaces[index][keyName] = value;
        setValues(publicPlaces, "publicMeetings")
    }

    const disableEdit = checkDateBlock('DATE_TO_BLOCK_BLOWER');
    return (
        <>
            <SettingsLayout disabled={disableEdit} handleUpdate={() => { updateBlowerInfo(false) }} handleClose={() => { updateBlowerInfo(true) }} map={<Map blower settings />}>
                <div id="personal-info" className="personal-info-btn clickAble" onClick={changeSettingsType}>
                    <div onClick={() => { changeSettingsTypeWithParameter('personal-info') }} className="noSelect">פרטים אישיים</div>
                    <div onClick={() => { changeSettingsTypeWithParameter('personal-info') }}
                        className="noSelect">{settingsType === 'personal-info' ? '-' : '+'}</div>
                </div>

                <div className="personal-info fade-in" style={{ display: settingsType === 'personal-info' ? 'block' : 'none' }}>

                    <div className="header">שם מלא</div>
                    <input autoComplete={'off'} id="name" type="text" value={vals.name || ""} onChange={(e) => setValues(e.target.value, "name")} maxLength={20} minLength={2} disabled={disableEdit} />
                    <div className="err-msg">{errs.name || ""}</div>


                    <div style={{ marginTop: "5%" }} className="header">טלפון</div>
                    <input autoComplete={'off'} id="phone-number" type="tel" value={vals.username || ""} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} disabled={disableEdit} />
                    <div className="err-msg">{errs.username || ""}</div>

                </div>

                <div id="blowing-set-btn" className="clickAble" onClick={changeSettingsType}>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('blowing-set-btn')}>הגדרות מפת התקיעות</div>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('blowing-set-btn')}>{settingsType === 'blowing-set-btn' ? '-' : '+'}</div>
                </div>

                <div id="blowing-set" className="fade-in" style={{ display: settingsType === 'blowing-set-btn' ? 'block' : 'none' }}>

                    <div className="header">כמה פעמים תוכל לתקוע?</div>
                    <input id="blowingTimes" type="number" value={vals.can_blow_x_times || ""} maxLength={2} onChange={(e) => setValues(e.target.value, 'can_blow_x_times')} disabled={disableEdit} />
                    <div className="err-msg">{errs && errs.can_blow_x_times || ""}</div>

                    <div style={{ marginTop: "5%" }} className="header">שעת יציאה</div>
                    <ThemeProvider theme={materialTheme}>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <Fragment>
                                <TimePicker
                                    disabled={disableEdit}
                                    ampm={false}
                                    value={vals.volunteering_start_time}
                                    onChange={(time) => setValues(time._d, 'volunteering_start_time')}
                                    format={format}
                                />
                            </Fragment>
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>

                    <div className="header">כתובת יציאה</div>

                    <FormSearchBoxGenerator value={vals.address || ""} onAddressChange={handleAddressChange} uId='address' defaultValue={originalVals.address} disabled={disableEdit} />
                    <div className="err-msg" style={{ marginBottom: "1rem" }}>{errs.address || ''}</div>

                    <div style={{ marginTop: "5%" }} className="max-time header">סמן את זמן ההליכה</div>
                    <Slider disabled={disableEdit} value={vals.volunteering_max_time || 0} min={15} max={180} onChange={(e, val) => setValues(val, "volunteering_max_time")} aria-labelledby="continuous-slider" />
                    <div className="max-time-val">{`עד ${vals.volunteering_max_time || 0} דקות`}</div>
                </div>

                <div id="public-blowing-set-btn" className="clickAble" onClick={changeSettingsType}>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('public-blowing-set-btn')}>תקיעות ציבוריות</div>
                    <div className="noSelect" onClick={() => changeSettingsTypeWithParameter('public-blowing-set-btn')}>{settingsType === 'public-blowing-set-btn' ? '-' : '+'}</div>
                </div>

                <div id="public-blowing-set" className="fade-in" style={{ display: (settingsType === 'public-blowing-set-btn' ? 'block' : 'none'), marginRight: "0" }}>
                    {vals.publicMeetings && vals.publicMeetings.map((place, index) => {
                        return (
                            <div key={place.id}>
                                <AddPublicPlace
                                    disabled={disableEdit}
                                    removePubPlace={removePubPlace}
                                    index={index}
                                    format={format}
                                    updatePublicPlace={updatePublicPlace}
                                    inSettings={true}
                                    info={place ? place : undefined}
                                />
                                <hr style={{ marginBottom: "5%" }} />
                            </div>
                        );
                    })}
                    {!disableEdit ? <div id="add-public-place" className={'clickAble'} onClick={() => { !disableEdit && addPublicPlace() }}>
                        <div id="plus">+</div>
                        <div>הוסף תקיעה במקום ציבורי</div>
                    </div> : null}
                </div>
                <div className="err-msg">{errs.general}</div>
            </SettingsLayout >

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>
    );
}
export default IsolatedSettings;