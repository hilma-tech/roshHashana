import React, { useEffect, useState, useContext } from 'react';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import GeneralAlert from '../../components/modals/general_alert';
import { checkDateBlock } from '../../fetch_and_utils';
import { CONSTS } from '../../consts/const_messages';
import { MainContext } from '../../ctx/MainContext';
import { isIOS } from "react-device-detect";
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import './Settings.scss';

const IsolatedSettings = (props) => {
    const { openGenAlert, showAlert } = useContext(MainContext);

    const [vals, setVals] = useState({});
    const [originalVals, setOriginalVals] = useState({});
    const [errs, setErrs] = useState({});

    const [openBlowingSet, setOpenBlowingSet] = useState(false);
    const [openPersInfo, setOpenPersInfo] = useState(false);


    useEffect(() => {
        (async () => {
            if (!vals || typeof vals !== "object" || !Object.keys(vals).length) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                if (err || !res) {
                    openGenAlert({ text: err === "NO_INTERNET" ? "אינך מחובר לאינטרנט, לא ניתן להציג את המידע כרגע" : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
                }
                else {
                    setVals(res);
                    setOriginalVals(res);
                }
            }
        })();
    }, []);


    //a function that handles set state generically
    const setValues = (val, valueName) => {
        setVals(v => ({ ...v, [valueName]: val }));
    }
    const setAnErr = (val, errName = "general") => {
        setErrs(errs => ({ ...errs, [errName]: val }))
    }


    const handlePhoneChange = (e) => {
        if (!isNaN(e.target.value) && e.target.value != "." && e.target.value != "-" && e.target.value != "+" && e.target.value != "e") {
            setValues(e.target.value, "username");
        }
    }
    const handleAddressChange = (placeName) => {
        setValues(placeName[0], "address")
        setValues(placeName[1] ? placeName[1].lng : null, "lng")
        setValues(placeName[1] ? placeName[1].lat : null, "lat")
    }
    const updateIsolatedInfo = async (fromX = false) => {
        if (!fromX && checkDateBlock()) {
            openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את הפרטים' });
            return;
        }

        const updateData = {};

        for (let field in { ...vals }) { // remove values that are as origin
            if (vals[field] !== originalVals[field]) {
                updateData[field] = typeof vals[field] === "string" ? vals[field].trim() : vals[field]
            }
        }
        if (fromX) {
            if (updateData && Object.keys(updateData).length !== 0) {
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
                        props.history.push('/');
                })
            return;
        }

        let { name, username, address, lng, lat, public_meeting, public_phone, comments } = updateData;
        // validate values
        if (comments && comments.length && !/^[A-Zא-תa-z0-9 '"-]{2,}$/.test(comments)) {
            openGenAlert({ text: 'לא ניתן להכניס תווים מיוחדים בתיאור' })
            setAnErr('לא ניתן להכניס תווים מיוחדים בתיאור', 'comments');
            return;
        }
        if (name && !/^[A-Zא-תa-z '"-]{2,}$/.test(name)) {
            openGenAlert({ text: 'השם שהזנת אינו תקין' })
            setAnErr('השם שהזנת אינו תקין', 'name');
            return;
        }

        if (username && (username[0] != 0 || username.length !== 10)) {
            openGenAlert({ text: 'מספר הפלאפון שהזנת אינו תקין' });
            setAnErr('מספר הפלאפון שהזנת אינו תקין', 'username');
            return;
        }
        if (address) {
            if (!address || address === CONSTS.NOT_A_VALID_ADDRESS || !lng || !lat) {
                openGenAlert({ text: CONSTS.PICK_FROM_LIST_ADDRESS_MSG_ERROR })
                setAnErr(CONSTS.PICK_FROM_LIST_ADDRESS_MSG_ERROR, "address");
                return;
            }
            updateData.address = [address, { lng, lat }]
        }

        setErrs({});
        //address to be Array
        //update isolated details
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify({ "data": updateData })
        }, true);
        if (res) {
            if (res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את הפרטים' });
                return;
            }
            openGenAlert({
                text: "נשמר בהצלחה",
                isPopup: { okayText: "אישור" }
            },
                (res) => {
                    if (res)
                        props.history.push('/', { name: name, address: Array.isArray(address) && address[0] || originalVals.address });
                })
        }
        if (err) {
            openGenAlert({ text: "חלה תקלה, לא ניתן לעדכן כעת. נסו שוב מאוחר יותר." })
        }
    }

    const disableEdit = checkDateBlock();

    return (
        <>
            <SettingsLayout disabled={disableEdit} handleClose={() => { updateIsolatedInfo(true) }} handleUpdate={() => { updateIsolatedInfo(false) }} map={<Map isolated settings />}>
                <div className="personal-info-btn clickAble" onClick={() => setOpenPersInfo(!openPersInfo)}>
                    <div>פרטים אישיים</div>
                    <div>{openPersInfo ? '-' : '+'}</div>
                </div>

                <div className="personal-info fade-in" style={{ display: openPersInfo ? 'block' : 'none' }}>
                    <div className="header">שם מלא</div>
                    <input autoComplete={'off'} id="name" type="text" value={vals.name || ""} onChange={(e) => setValues(e.target.value, "name")} maxLength={20} minLength={2} disabled={disableEdit} />
                    <div className="err-msg">{errs.name || ""}</div>

                    <div style={{ marginTop: "5%" }} className="header">טלפון</div>
                    <input autoComplete={'off'} id="phone-number" type="tel" value={vals.username || ""} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} disabled={disableEdit} />
                    <div className="err-msg">{errs.username || ""}</div>

                </div>

                <div id="blowing-set-btn" className="clickAble" onClick={() => setOpenBlowingSet(!openBlowingSet)}>
                    <div >הגדרות לתקיעה בשופר</div>
                    <div>{openBlowingSet ? '-' : '+'}</div>
                </div>

                <div id="blowing-set" className="fade-in" style={{ display: openBlowingSet ? 'block' : 'none' }}>
                    <div className="header">כתובת</div>
                    <FormSearchBoxGenerator disabled={disableEdit} value={vals.address} onAddressChange={handleAddressChange} uId="publicPlaces-form-search-input-1" className='address' defaultValue={vals.address} />
                    <div className="err-msg">{errs.address || ""}</div>

                    <div style={{ marginTop: "5%" }} className="preferance header2">מהם העדפותיך לשמיעת תקיעת השופר?</div>
                    <div className="checkbox-container ">
                        <div className="header">בפתח הבית - תקיעה פרטית</div>
                        <input className="clickAble" onChange={(e) => { setValues(e.target.checked ? false : true, "public_meeting") }} checked={vals.public_meeting ? false : true} type="radio" name="preferance" style={{ marginTop: isIOS ? '0' : '2%' }} disabled={disableEdit} />
                    </div>
                    <div className="checkbox-container ">
                        <div className="header">בחלון או במרפסת הפונה לרחוב - תקיעה ציבורית</div>
                        <input id="public-meeting" onChange={(e) => { setValues(e.target.checked ? true : false, "public_meeting") }} checked={vals.public_meeting ? true : false} className="clickAble" type="radio" name="preferance" style={{ marginTop: isIOS ? '0' : '2%' }} disabled={disableEdit} />
                    </div>

                    <div className="header">הערות ותיאור הכתובת</div>
                    <input autoComplete={'off'} id="comments" type="text" value={vals.comments || ""} onChange={(e) => setValues(e.target.value, "comments")} maxLength={254} disabled={disableEdit} />
                    <div className="err-msg">{errs.comments || ""}</div>

                    <div className="checkbox-container approval header">
                        <div className="header2">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                        <input id="public-phone" onChange={(e) => { setValues(e.target.checked ? true : false, "public_phone") }} checked={vals.public_phone ? true : false || ""} className="clickAble" type="checkbox" style={{ marginTop: isIOS ? '0' : '2%' }} disabled={disableEdit} />
                    </div>
                </div>
                <div className="err-msg">{errs.general || ""}</div>

            </SettingsLayout>
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>

    );
}
export default IsolatedSettings;