import React, { useEffect, useState, useContext } from 'react';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import Auth from '../../modules/auth/Auth';
import './Settings.scss';
import { FormSearchBoxGenerator } from '../../components/maps/search_box_generator';
import { MainContext } from '../../ctx/MainContext';
import GeneralAlert from '../../components/modals/general_alert';
import { CONSTS } from '../../const_messages';

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
                setVals(res);
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
    const updateIsolatedInfo = async () => {
        // let nameVal = name;
        // let usernameVal = username;
        // let public_meeting = document.getElementById('public-meeting');
        // let public_phone = document.getElementById('public-phone');
        const updateData = {};

        for (let field in { ...vals }) { // remove values that are as origin
            if (vals[field] !== originalVals[field]) {
                updateData[field] = typeof vals[field] === "string" ? vals[field].trim() : vals[field]
            }
        }
        if (!Object.keys(updateData) || !Object.keys(updateData).length) {
            openGenAlert({ text: CONSTS.NO_SETTINGS_CHANGE_MSG });
            return;
        }
        console.log('!updateData info: ', updateData);

        let { name, username, address, lng, lat, public_meeting, public_phone } = updateData;
        // validate values

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

        // let newData = {
        //     "name": nameVal,
        //     "username": usernameVal,
        //     "public_phone": public_phone.checked,
        //     "address": address,
        //     "comments": comments,
        //     "public_meeting": public_meeting.checked ? 1 : 0
        // }
        setErrs({});
        //address to be Array
        //update isolated details
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify({ "data": updateData })
        }, true);
        if (res) {
            props.history.push('/', { name: name, address: Array.isArray(address) && address[0] || originalVals.address });
        }
    }

    return (
        <>
            <SettingsLayout handleClose={() => { props.history.push('/'); }}>
                <button onClick={updateIsolatedInfo} >שמור</button>
                <div className="personal-info-btn clickAble" onClick={() => setOpenPersInfo(!openPersInfo)}>
                    <div>פרטים אישיים</div>
                    <div>{openPersInfo ? '-' : '+'}</div>
                </div>

                <div className="personal-info fade-in" style={{ display: openPersInfo ? 'block' : 'none' }}>
                    <div className="header">שם מלא</div>
                    <input autoComplete={'off'} id="name" type="text" value={vals.name || ""} onChange={(e) => setValues(e.target.value, "name")} maxLength={20} />
                    <div className="err-msg">{errs.name || ""}</div>

                    <div style={{ marginTop: "5%" }} className="header">טלפון</div>
                    <input autoComplete={'off'} id="phone-number" type="tel" value={vals.username || ""} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} />
                    <div className="err-msg">{errs.username || ""}</div>

                </div>

                <div id="blowing-set-btn" className="clickAble" onClick={() => setOpenBlowingSet(!openBlowingSet)}>
                    <div >הגדרות לתקיעה בשופר</div>
                    <div>{openPersInfo ? '-' : '+'}</div>
                </div>

                <div id="blowing-set" className="fade-in" style={{ display: openBlowingSet ? 'block' : 'none' }}>
                    <div className="header">כתובת</div>
                    <FormSearchBoxGenerator value={vals.address} onAddressChange={handleAddressChange} uId="publicPlaces-form-search-input-1" className='address' defaultValue={vals.address} />
                    <div className="err-msg">{errs.address || ""}</div>

                    <div style={{ marginTop: "5%" }} className="preferance header2">מהם העדפותיך לשמיעת תקיעת השופר?</div>
                    <div className="checkbox-container ">
                        <div className="header">בפתח הבית</div>
                        <input className="clickAble" onChange={(e) => { setValues(e.target.checked ? false : true, "public_meeting") }} checked={vals.public_meeting ? false : true} type="radio" name="preferance"/>
                    </div>
                    <div className="checkbox-container ">
                        <div className="header">בחלון או במרפסת הפונה לרחוב</div>
                        <input id="public-meeting" onChange={(e) => { setValues(e.target.checked ? true : false, "public_meeting") }} checked={vals.public_meeting ? true : false} className="clickAble" type="radio" name="preferance" />
                    </div>

                    <div className="header">הערות ותיאור הכתובת</div>
                    <input autoComplete={'off'} id="comments" type="text" defaultValue={vals.comments || ""} value={vals.comments || ""} onChange={(e) => setValues(e.target.value, "comments")} />

                    <div className="checkbox-container approval header">
                        <div className="header2">אני מאשר שמספר הפלאפון שלי ישלח לבעל התוקע</div>
                        <input id="public-phone" onChange={(e) => { setValues(e.target.checked ? true : false, "public_phone") }} checked={vals.public_phone ? true : false || ""} className="clickAble" type="checkbox" ></input>
                    </div>
                </div>
                <div className="err-msg">{errs.general || ""}</div>
            </SettingsLayout>
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>

    );
}
export default IsolatedSettings;