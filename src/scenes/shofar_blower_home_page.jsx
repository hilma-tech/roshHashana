import React, { useEffect, useState, useContext } from 'react';

import { MainContext } from '../ctx/MainContext';
import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import GeneralAlert from '../components/modals/general_alert'
import SBAssignMeeting from '../components/sb_assign_meeting';
import SBNotConfirmed from '../components/sb_not_confirmed';

import './sb.scss'
import './mainPages/MainPage.scss';
import SBSideInfo from '../components/sb_side_info';

let fetching = false
const SBHomePage = (props) => {

    const { showAlert, openGenAlert,
        myMeetings, meetingsReqs,
        setMyMeetings, setMeetingsReqs,
        assignMeetingInfo } = useContext(SBContext)

    const { userInfo: userData, setUserInfo: setUserData } = useContext(MainContext)

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
                        {/* ALL THINGS FOR MAP PAGE */}
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? <SBAssignMeeting /> : null}
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? null : <SBSideInfo history={props.history} />}

                        {assignMeetingInfo && typeof assignMeetingInfo === "object" && onMobile ? null : <ShofarBlowerMap history={props.history} />}
                    </>
                    :
                    /* USER IS NOT CONFIRMED */
                    <SBNotConfirmed history={props.history} onMobile={onMobile} openGenAlert={openGenAlert} />
                )
            }

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </div>
    );
}

export default SBHomePage;