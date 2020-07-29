import React, { useEffect, useState } from 'react';
import { isBrowser } from "react-device-detect";
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import './MainPage.scss';

const IsolatedPage = (props) => {
    const [openMap, setOpenMap] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    if (!props.location || !props.location.state || !props.location.state.name || !props.location.state.address)
        Auth.logout(window.location.href = window.location.origin);

    useEffect(() => {
        (async () => {
            if (props.location && props.location.state && props.location.state.name && props.location.state.address) {
                setName(props.location.state.name);
                setAddress(props.location.state.address);
            }
            else {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                console.log(res, 'res')

                if (res) {
                    const city = res.userCity || '';
                    const street = res.street || '';
                    const appartment = res.appartment || '';
                    const comments = res.comments || '';

                    setAddress(city + ' ' + street + ' ' + appartment + ' ' + comments);
                    setName(res.name)
                }
            }
        })();
    }, []);

    const closeOrOpenMap = () => {
        setOpenMap(!openMap);
    }

    const openSettings = () => {
        props.history.push('/settings');
    }

    //cancel the request and delete the user
    const cancelRequest = async () => {
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "DELETE",
        });
        if (res && res.res === 'SUCCESS') {
            Auth.logout(window.location.href = window.location.origin);
        }
        // else  TODO: לשים הודעה שזה נכשל
    }

    return (
        <>
            <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} >
                <div className="settings clickAble" onClick={openSettings}><img src="/icons/settings.svg" /></div>
                <div className="content-container">
                    <div>{`שלום ${name}`}</div>
                    <div id="thank-you-msg">ותודה על התעניינותך בתקיעת שופר.</div>
                    <div>אנו מחפשים עבורך בעל תוקע שיגיע עד אליך</div>
                    <div>לכתובת:</div>
                    <div id="address" style={{ marginBottom: isBrowser ? '2%' : '50%' }}>{address}</div>
                    <div id="cancel-request" onClick={cancelRequest} style={{ marginBottom: isBrowser ? '0%' : '20%' }} className="clickAble">לביטול בקשה לאיתור בעל תוקע</div>
                    <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                        <img src='/images/map.svg' />
                    </div>
                </div>

            </div>
            {openMap && <Map closeMap={closeOrOpenMap} isolated />}
        </>
    );
}

export default IsolatedPage;