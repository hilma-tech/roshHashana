import React, { useEffect, useState, useContext } from 'react';
import { MainContext } from '../../ctx/MainContext';

import { isBrowser } from "react-device-detect";
import Auth from '../../modules/auth/Auth';
import moment from "moment"
import Map from '../../components/maps/map';

import GeneralAlert from '../../components/modals/general_alert';

import './MainPage.scss';

const IsolatedPage = (props) => {
    const { showAlert, openGenAlert, userInfo, setUserInfo } = useContext(MainContext);
    const [openMap, setOpenMap] = useState(false);

    useEffect(() => {
        (async () => {
            if (!userInfo || typeof userInfo !== 'object' || !userInfo.name || !userInfo.comments || !userInfo.address || !userInfo.blowerMeetingId) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                if (err || !res) {
                    openGenAlert({ text: err === "NO_INTERNET" ? "אינך מחובר לאינטרנט, לא ניתן להציג את המידע כרגע" : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
                }
                else {
                    if (res.errMsg && res.errMsg === 'LOG_OUT') {
                        Auth.logout(window.location.href = window.location.origin);
                        return;
                    }
                    setUserInfo(res)
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

    const name = (userInfo && userInfo.name) ? userInfo.name : '',
        comment = (userInfo && userInfo.comments) ? userInfo.comments : '',
        address = (userInfo && userInfo.address) ? userInfo.address : '',
        blowerMeetingId = (userInfo && userInfo.blowerMeetingId) ? userInfo.blowerMeetingId : null,
        blowerName = (userInfo && userInfo.blowerName) ? userInfo.blowerName : '',
        meetingTime = (userInfo && userInfo.meeting_time) ? moment(userInfo.meeting_time).format("HH:mm") : ''
    return (
        <>
            <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} style={{ width: isBrowser ? '40%' : '100%' }}>
                <div className="settings clickAble" onClick={openSettings}><img alt="" src="/icons/settings.svg" /></div>
                <div className="content-container" style={{ overflowY: isBrowser ? "none" : "scroll" }}>
                    <div>{`שלום ${name}`}</div>
                    {(blowerMeetingId && blowerName) ?
                        <>
                            <div> אנחנו שמחים לבשר, שמצאנו בעל תוקע שיגיע עד אליך למפגש תקיעת שופר. אלו הפרטים:</div>
                            <div className="meeting-info">
                                <div className="blower-name info-container"><img className="icon" src='/icons/blueShofar.svg' /><div>{`בעל תוקע: ${blowerName}`}</div></div>
                                <div className="meeting-address info-container"><img className="icon" src='/icons/location.svg' /><div>{address + ', ' + comment}</div></div>
                                <div className="meeting-time info-container">
                                    <img className="icon" src='/icons/blueClock.svg' />
                                    <div>
                                        <div>{`בשעה ${meetingTime}`}</div>
                                        <div className="msg">הודעה סופית על זמן התקיעה תשלח ביום חמישי, כ"ח באלול 17.9</div>
                                    </div>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            <div id="thank-you-msg">ותודה על התעניינותך בתקיעת שופר.</div>
                            <div>אנו מחפשים עבורך בעל תוקע שיגיע עד אליך</div>
                            <div>לכתובת:</div>
                            <div style={{ marginBottom: isBrowser ? '15%' : '0%' }} >
                                <div id="address-info" style={{ marginBottom: isBrowser ? '0%' : '0%' }}>{address}</div>
                                {comment && comment.length ? <div style={{ marginTop: isBrowser ? '2%' : '0%' }}>{comment}</div> : null}
                            </div>
                        </>
                    }
                    <div id="cancel-request" onClick={cancelRequest} style={{ marginBottom: isBrowser ? '0%' : '5%' }} className="clickAble">לביטול בקשה לאיתור בעל תוקע</div>
                    {!isBrowser && <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                        <img alt="" src='/images/map.svg' />
                    </div>}
                </div>

            </div>
            {(openMap || isBrowser) && <Map closeMap={closeOrOpenMap} isolated />}

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </>
    );
}

export default IsolatedPage;