import React, { useEffect, useState, useContext } from 'react';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import GeneralAlert from '../../components/modals/general_alert';
import { checkDateBlock } from '../../fetch_and_utils';
import { CONSTS } from '../../consts/const_messages';
import { MainContext } from '../../ctx/MainContext';
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import './Settings.scss';


const IsolatedSettings = (props) => {
    const { userInfo, setUserInfo, openGenAlert, showAlert } = useContext(MainContext)
    const [originalIsolatedInfo, setOriginalIsolatedInfo] = useState({});
    const [msgErr, setMsgErr] = useState('');
    const [phoneMsgErr, setPhoneMsgErr] = useState('');
    const [nameMsgErr, setNameMsgErr] = useState('');
    const [meetAddres, setMeetAddress] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        (async () => {
            if (!Object.keys(originalIsolatedInfo).length) {
                if (!userInfo || !props.history.location || !props.history.location.state || !props.history.location.state.meetAddress) {
                    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                        headers: { Accept: "application/json", "Content-Type": "application/json" },
                    }, true);
                    if (res) {
                        if (res === "NO_MEETING_DELETE_USER") {
                            openGenAlert({ text: "בעל התוקע של פגישה זו מחק את הפגישה, אם ברצונך להשתתף בפגישה נוספת תוכל לעשות זאת במפה הכללית כמשתמש חדש", isPopup: { okayText: "הבנתי, התנתק" } }, () => {
                                Auth.logout()
                            })
                            return;
                        } else {
                            setUserInfo(res)
                            setValues(res, setOriginalIsolatedInfo);
                            setValues(res.name, setName);
                            setValues(res.username, setUsername);
                            setValues(`${res.meetingInfo.address}, ${res.meetingInfo.comments ? res.meetingInfo.comments : ''}`, setMeetAddress);
                        }
                    }
                }
                else {
                    setValues(userInfo, setOriginalIsolatedInfo);
                    setValues(userInfo.name, setName);
                    setValues(userInfo.username, setUsername);
                    setValues(props.history.location.state.meetAddress, setMeetAddress)
                }
            }
        })();
    }, []);

    //a function that handles set state generically
    const setValues = (val, setFunc) => {
        setFunc(val);
    }

    const handlePhoneChange = (e) => {
        if (!isNaN(e.target.value) && e.target.value != "." && e.target.value != "-" && e.target.value != "+" && e.target.value !== "e") {
            setValues(e.target.value, setUsername);
        }
    }

    const updateIsolatedInfo = async (fromX = false) => {

        if (checkDateBlock('DATE_TO_BLOCK_ISOLATED')) {
            openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את הפרטים', block: true });
            return;
        }

        //2 lines: checking if info has changed, otherwise is null
        let nameVal = name === originalIsolatedInfo.name ? null : name;
        let usernameVal = username === originalIsolatedInfo.username ? null : username;
        if (fromX) {
            if (nameVal === null && usernameVal === null) {
                props.history.goBack();
                return
            } else {
                openGenAlert({ text: `האם אתה בטוח שברצונך לצאת? \n השינויים שביצעת לא ישמרו`, isPopup: { okayText: "צא", cancelText: "המשך לערוך" } },
                    (res) => {
                        if (res) {
                            props.history.goBack();
                        }
                        return
                    })
                return
            }
        }
        //will continue to update only if both are not null

        if (nameVal === null && usernameVal === null) {
            openGenAlert({
                text: "נשמר בהצלחה",
                isPopup: { okayText: "אישור" }
            },
                (res) => {
                    if (res) {
                        props.history.push('/', { name: nameVal });
                    }
                })
            return;
        }

        if (nameVal && !/^[A-Zא-תa-z '"-]{2,}$/.test(nameVal)) {
            openGenAlert({ text: 'השם שהזנת אינו תקין' })
            setNameMsgErr('השם שהזנת אינו תקין');
            return;
        }

        if (usernameVal && (usernameVal[0] != 0 || usernameVal.length != 10)) {
            openGenAlert({ text: 'מספר הפלאפון שהזנת אינו תקין' });
            setPhoneMsgErr('מספר הפלאפון שהזנת אינו תקין');
            return;
        }
        let newData = {}
        if (nameVal) newData.name = nameVal
        if (usernameVal) newData.username = usernameVal
        setMsgErr('');
        //update isolated details
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify({ data: newData })
        }, true);
        if (err || !res) {
            openGenAlert({ text: err && err.error && err.error.message === "PHONE_EXISTS" ? "מספר הטלפון בשימוש" : "חלה תקלה, לא ניתן לעדכן כעת. נסו שוב מאוחר יותר." })
        }
        if (res) {
            if (res === 'NO_MEETING_DELETE_USER') {
                openGenAlert({ text: "בעל התוקע של פגישה זו מחק את הפגישה, אם ברצונך להשתתף בפגישה נוספת תוכל לעשות זאת במפה הכללית כמשתמש חדש", isPopup: { okayText: "הבנתי, התנתק" } }, () => {
                    Auth.logout()
                });
            }

            if (res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את הפרטים' });
                return;
            }
            openGenAlert({
                text: "נשמר בהצלחה",
                isPopup: { okayText: "אישור" }
            },
                (res) => {
                    if (res) {
                        if (nameVal) userInfo.name = nameVal
                        if (usernameVal) userInfo.username = usernameVal
                        if (nameVal && usernameVal) setUserInfo(userInfo)
                        props.history.push('/', { name: nameVal });
                    }
                })
        }
    }

    const disableEdit = checkDateBlock('DATE_TO_BLOCK_ISOLATED');

    return (
        <>
            <SettingsLayout disabled={disableEdit} handleClose={() => { updateIsolatedInfo(true) }} handleUpdate={() => { updateIsolatedInfo(false) }} map={<Map meetAddress={meetAddres} isolated settings />}>
                <div className="personal-info fade-in" >
                    <div className="header">שם מלא</div>
                    <input autoComplete={'off'} id="name" type="text" value={name} onChange={(e) => setValues(e.target.value, setName)} maxLength={20} minLength={2} disabled={disableEdit} />
                    <div className="err-msg">{nameMsgErr}</div>
                    <div style={{ marginTop: "5%" }} className="header">טלפון</div>
                    <input autoComplete={'off'} id="phone-number" type="tel" value={username} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} disabled={disableEdit} />
                    <div className="err-msg">{phoneMsgErr}</div>
                </div>
                <div className="err-msg">{msgErr}</div>
            </SettingsLayout>
            {/* {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null} */}
        </>
    );
}
export default IsolatedSettings;