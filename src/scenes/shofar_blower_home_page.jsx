import React, { useEffect, useContext } from 'react'
import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import GeneralAlert from '../components/modals/general_alert'
import SBAssignMeeting from '../components/sb_assign_meeting';
import SBRouteInfo from '../components/sb_route_info';

import './sb.scss'
import '../components/maps/map.scss';


let fetching = false
const SBHomePage = (props) => {
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

    const fetchAndSetData = async () => {
        fetching = true
        let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/mapInfoSB`, null, true);
        if (err || !mapContent) {
            const error = err === "NO_INTERNET" ? "אין חיבור לאינטרנט, לא ניתן לטעון את המידע" : (err.error && err.error.status === "401" ? false : "אירעה שגיאה, נא נסו שנית מאוחר יותר")
            error && openGenAlert({ text: error })
            console.log("error getting sb map content ", err);
        }
        if (mapContent === "NO_CITY") {
            Auth.logout()
            return;
        }
        else if (mapContent && typeof mapContent === "object" && mapContent.userData && mapContent.userData[0]) {
            if (!meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length)) setMeetingsReqs(mapContent.openReqs)
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
                        <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
                        <div className="not-confirm-msg">מנהל המערכת טרם אישר אותך</div>
                    </>
                )
            }

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </div>
    );
}

export default SBHomePage;