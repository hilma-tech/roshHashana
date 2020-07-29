import React, { useEffect, useState, useContext } from 'react';
import SettingsLayout from '../../components/settingsLayout/SettingsLayout';
import Auth from '../../modules/auth/Auth';
import './Settings.scss';
import { MainContext } from '../../ctx/MainContext';

const IsolatedSettings = (props) => {
    const { userInfo, setUserInfo } = useContext(MainContext)

    const [isolatedInfo, setIsolatedInfo] = useState({});
    const [msgErr, setMsgErr] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        (async () => {
            if (!Object.keys(isolatedInfo).length) {
                if (!userInfo) {
                    console.log("from server")
                    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                        headers: { Accept: "application/json", "Content-Type": "application/json" },
                    }, true);
                    setUserInfo(res)
                    setValues(res, setIsolatedInfo);
                    setValues(res.name, setName);
                    setValues(res.username, setUsername);
                }
                else {
                    console.log("from context", userInfo)
                    setValues(userInfo, setIsolatedInfo);
                    setValues(userInfo.name, setName);
                    setValues(userInfo.username, setUsername);

                }
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

    const updateIsolatedInfo = async () => {

        let nameVal = name;
        let usernameVal = username;

        if (!nameVal) nameVal = isolatedInfo.name;
        if (!usernameVal) usernameVal = isolatedInfo.username;
        if (usernameVal[0] !== 0) { setMsgErr('מספר הפלאפון שהזנת אינו תקין'); return; }

        let newData = {
            "name": nameVal,
            "username": usernameVal,
        }

        setMsgErr('');
        //update isolated details
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateUserInfo`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify({ "data": newData })
        }, true);
        if (res) {
            props.history.push('/', { name: nameVal });
        }
    }

    return (
        <SettingsLayout handleClose={updateIsolatedInfo}>
            <div className="personal-info fade-in" >
                <div className="header">שם מלא</div>
                <input autoComplete={'off'} id="name" type="text" value={name} onChange={(e) => setValues(e.target.value, setName)} maxLength={20} />
                <div className="header">טלפון</div>
                <input autoComplete={'off'} id="phone-number" type="tel" value={username} onChange={(e) => handlePhoneChange(e)} maxLength={10} minLength={7} pattern={'/^[0-9]+$/'} />
            </div>
            <div className="err-msg">{msgErr}</div>
        </SettingsLayout>
    );
}
export default IsolatedSettings;