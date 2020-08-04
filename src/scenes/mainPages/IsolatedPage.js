import React, { useEffect, useState, useContext } from 'react';
import { MainContext } from '../../ctx/MainContext';

import { isBrowser } from "react-device-detect";
import Auth from '../../modules/auth/Auth';

import Map from '../../components/maps/map';

import GeneralAlert from '../../components/modals/general_alert';

import './MainPage.scss';

const IsolatedPage = (props) => {
    const { showAlert, openGenAlert } = useContext(MainContext);
    const [openMap, setOpenMap] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [comment, setComment] = useState('');

    if (!props.location || !props.location.state || !props.location.state.name || !props.location.state.address)
        Auth.logout(window.location.href = window.location.origin);

    useEffect(() => {
        (async () => {
            if (props.location && props.location.state && props.location.state.name && props.location.state.address) {
                setName(props.location.state.name);
                setAddress(props.location.state.address);
                props.location.state.comments && setComment(props.location.state.comments)
            }
            else {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);

                if (res) {
                    setName(res.name)
                    setAddress(res.address);
                    setComment(res.comments);
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
    const cancelRequest = () => {
        openGenAlert({ text: "האם את/ה בטוח/ה שברצונך לבטל את הבקשה?", isPopup: { okayText: "כן", cancelText: "לא" } }, async (continuE) => {
            if (!continuE) return
            let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                method: "DELETE",
            });
            if (res && res.res === 'SUCCESS') {
                Auth.logout(window.location.href = window.location.origin);
            }
            else openGenAlert({ text: "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
        })
    }

    return (
        <>
            <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} >
                <div className="settings clickAble" onClick={openSettings}><img alt="" src="/icons/settings.svg" /></div>
                <div className="content-container">
                    <div>{`שלום ${name}`}</div>
                    <div id="thank-you-msg">ותודה על התעניינותך בתקיעת שופר.</div>
                    <div>אנו מחפשים עבורך בעל תוקע שיגיע עד אליך</div>
                    <div>לכתובת:</div>
                    <div id="address-info" style={{ marginBottom: isBrowser ? '0%' : '0%' }}>{address}</div>
                    {comment && comment.length ? <div style={{ marginBottom: isBrowser ? '2%' : '30%' }}>{comment}</div> : null}
                    <div id="cancel-request" onClick={cancelRequest} style={{ marginBottom: isBrowser ? '0%' : '20%' }} className="clickAble">לביטול בקשה לאיתור בעל תוקע</div>
                    <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                        <img alt="" src='/images/map.svg' />
                    </div>
                </div>

            </div>
            {openMap && <Map closeMap={closeOrOpenMap} isolated />}

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>
    );
}

export default IsolatedPage;