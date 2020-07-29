import React, { useEffect, useState, useContext } from 'react';
import { isBrowser } from "react-device-detect";

import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import GeneralAlert from '../components/modals/general_alert'
import SBAssignMeeting from '../components/sb_assign_meeting';
import SBRouteInfo from '../components/sb_route_info';
import Map from '../components/maps/map';
import './sb.scss'
import '../components/maps/map.scss';
import './mainPages/MainPage.scss';

let fetching = false
const SBHomePage = (props) => {
    const [openMap, setOpenMap] = useState(false);
    const { showAlert, openGenAlert,
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs,
        assignMeetingInfo } = useContext(SBContext)

    const onMobile = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i].some(toMatchItem => navigator.userAgent.match(toMatchItem));

    useEffect(() => {
        (async () => {
            if (!fetching && (
                !meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length) ||
                !myMeetings || (Array.isArray(myMeetings) && !myMeetings.length) ||
                !userData || (Array.isArray(userData) && !userData.length))
            ) {
                fetchAndSetData()
            }
        })();
    }, []);
    const closeOrOpenMap = () => {
        setOpenMap(!openMap);
    }
    const cancelVolunteering = async () => {
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "DELETE",
        });
        if (res && res.res === 'SUCCESS') {
            Auth.logout(window.location.href = window.location.origin);
        }
        else openGenAlert({ text: "סליחה, הפעולה נכשלה, נא נסו שנית מאוחר יותר" })
    }

    const fetchAndSetData = async () => {
        fetching = true
        let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/mapInfoSB`, null, true);
        if (err || !mapContent) {
            const error = err === "NO_INTERNET" ? "אין חיבור לאינטרנט, לא ניתן לטעון את המידע" : (err.error && err.error.status === "401" ? false : "אירעה שגיאה, נא נסו שנית מאוחר יותר")
            error && openGenAlert({ text: error })
            console.log("error getting sb map content ", err);
        }
        if (mapContent === "NO_CITY") {
            console.log('hereee')
            Auth.logout()
            return;
        }
        else if (mapContent && typeof mapContent === "object" && mapContent.userData && mapContent.userData[0]) {
            if (!meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length)) setMeetingsReqs(mapContent.openReqs)
            //sort my routes by startTime, where closest (lowest) is first
            if (!myMeetings || (Array.isArray(myMeetings) && !myMeetings.length)) setMyMeetings(Array.isArray(mapContent.myRoute) ? mapContent.myRoute.sort((a, b) => (new Date(a.startTime) > new Date(b.startTime) ? 1 : new Date(a.startTime) < new Date(b.startTime) ? -1 : 0)) : null)
            if (!userData || (Array.isArray(userData) && !userData.length)) setUserData(mapContent.userData[0])
            //if got .length == limit, call again -- and on SET need to check if already is data and then add and not set
        }
        fetching = false
    }


    return (
        <div className="sb-homepage-container">
            {
                !userData && !meetingsReqs && !myMeetings ? <div>loading!</div> : ((userData && typeof userData === "object" && userData.confirm == 1) ?
                    <>
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? <SBAssignMeeting /> : null}
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? null : <SBRouteInfo history={props.history} />}

                        {assignMeetingInfo && typeof assignMeetingInfo === "object" && onMobile ? null : <ShofarBlowerMap history={props.history} />}
                    </>
                    :
                    <>
                        <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} >
                            <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
                            <div className="content-container">
                                <div id="thank-you-msg">תודה על הרשמתך.</div>
                                <div>בזמן הקרוב נתקשר אליך על מנת לאמת פרטים ולהדריך לגבי הצעדים הבאים.</div>
                                <div>בברכה,<br></br>צוות יום תרועה.</div>
                                <div id="cancel-request" onClick={cancelVolunteering} style={{ marginBottom: isBrowser ? '0%' : '20%' }} className="clickAble">לביטול בקשתך</div>
                                <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                                    צפייה במפה
                                <img src='/images/map.svg' />
                                </div>
                            </div>
                        </div>
                        {openMap && <Map closeMap={closeOrOpenMap} blower />}{/*general map with no option to assign yourself to the meetings */}
                    </>
                )
            }

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </div>
    );
}

export default SBHomePage;