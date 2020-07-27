import React, { useEffect, useContext } from 'react'
import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import GeneralAlert from '../components/modals/general_alert'
import SBAssignMeeting from '../components/sb_assign_meeting';

import './sb.scss'
import '../components/maps/map.scss';
import { useRef } from 'react';
import { isComputedProp } from 'mobx';


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
            openGenAlert({ text: "אירעה שגיאה עם הבאת המידע, נא נסו שנית מאוחר יותר" })
            console.log("error getting sb map content ", err);
        }
        else if (mapContent && typeof mapContent === "object" && mapContent.userData && mapContent.userData[0]) {
            if (!meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length)) setMeetingsReqs(mapContent.openReqs)
            if (!myMeetings || (Array.isArray(myMeetings) && !myMeetings.length)) setMyMeetings(mapContent.myRoute.sort((a, b) => (new Date(a.startTime) > new Date(b.startTime) ? 1 : new Date(a.startTime) < new Date(b.startTime) ? -1 : 0)))
            if (!userData || (Array.isArray(userData) && !userData.length)) setUserData(mapContent.userData[0])
            //if got .length == limit, call again -- and on SET need to check if already is data and then add and not set
        }
        fetching = false
    }

    return (
        <div>
            {
                !userData ? <div>loading!</div> : ((typeof userData === "object" && userData.confirm !== undefined && userData.confirm == 0) ? <div>מנהל המערכת טרם אישר אותך</div> :
                    <>
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" && onMobile ? null : <ShofarBlowerMap history={props.history} />}

                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? <SBAssignMeeting /> : null}
                    </>
                )
            }

            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </div>
    );
}

export default SBHomePage;