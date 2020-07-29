import React, { useContext, useState, useEffect } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import { assignSB } from '../fetch_and_utils'

const SBAssignMeeting = (props) => {
    const { assignMeetingInfo, openGenAlert, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        meetingsReqs, setMeetingsReqs,
        assigns, setAssigns,
        userData
    } = useContext(SBContext)

    if (!assignMeetingInfo || typeof assignMeetingInfo !== "object") {
        props.history.push('/sh-map')
        return;
    }


    const handleAssignment = async (close) => {
        if (close === "close") {
            setAssignMeetingInfo(null)
            return;
        }
        //set new route and remove meetingId from reqs array
        if (myMeetings.length == userData.can_blow_x_times) {
            openGenAlert({ text: `מספר התקיעות הנוכחי שלך הוא ${myMeetings.length} וציינת שאתה תוקע ${userData.can_blow_x_times}, לכן לא ניתן כעת לשבץ`, isPopup: { okayText: "הבנתי" } })
            return;
        }
        setAssigns(a => Array.isArray(a) ? [...a, assignMeetingInfo] : [assignMeetingInfo])
        if(!myMeetings.includes(assignMeetingInfo)) setMyMeetings(mym => Array.isArray(mym) ? [...mym, assignMeetingInfo] : [assignMeetingInfo])
        setMeetingsReqs(reqs => reqs.filter(r => r.meetingId != assignMeetingInfo.meetingId))
        setAssignMeetingInfo(null)
    }


    return (
        <div className={props.onMobile ? "sb-side-info-mobile-container" : "sb-side-info-container"} >
            {JSON.stringify(assignMeetingInfo)}
            <button onClick={handleAssignment} >assign</button>
            <button onClick={() => { handleAssignment("close") }} >x</button>
        </div>
    );
}

export default SBAssignMeeting;