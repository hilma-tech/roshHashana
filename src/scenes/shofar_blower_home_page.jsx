import React, { useEffect, useContext } from 'react'
import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import GeneralAlert from '../components/modals/general_alert'


const SBHomePage = (props) => {
    const { showAlert, openGenAlert,
        userData, myMeetings, meetingsReqs,
        setUserData, setMyMeetings, setMeetingsReqs, } = useContext(SBContext)

    useEffect(() => {
        (async () => {
            let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/openSBRequests`, { headers: { Accept: "application/json", "Content-Type": "application/json" } }, true);
            if (err || !mapContent) {
                openGenAlert({ text: "אירעה שגיאה עם הבאת המידע, נא נסו שנית מאוחר יותר" })
                console.log("error getting sb map content ", err);
            }
            else if (mapContent && typeof mapContent === "object" && mapContent.userData && mapContent.userData[0]) {
                if (!meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length)) setMeetingsReqs(mapContent.openReqs);
                if (!myMeetings || (Array.isArray(myMeetings) && !myMeetings.length)) setMyMeetings(mapContent.myRoute)
                if (!userData || (Array.isArray(userData) && !userData.length)) setUserData(mapContent.userData[0])
                //if got .length == limit, call again -- and on SET need to check if already is data and then add and not set
            }
        })();
    }, []);

    return (
        <div>
            <ShofarBlowerMap />
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}
        </div>
    );
}

export default SBHomePage;