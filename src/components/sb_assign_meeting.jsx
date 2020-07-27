import React, { useContext, useState, useEffect } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';

import Auth from '../modules/auth/Auth';

import { assignSB } from '../fetch_and_utils'

const SBAssignMeeting = (props) => {
    const { assignMeetingInfo, openGenAlert, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        meetingsReqs, setMeetingsReqs } = useContext(SBContext)

    if (!assignMeetingInfo || typeof assignMeetingInfo !== "object") {
        props.history.push('/sh-map')
        return;
    }


    const handleAssignment = async (close) => {
        // assignSB(assignMeetingInfo, error => {
        //      openGenAlert({ text: error || "השתבצת בהצלחה" })
        // })
        if (close === "close") {
            setAssignMeetingInfo(null)
            return;
        }
        openGenAlert({ text: " ... " })
        //set new route and remove meetingId from reqs array
        setMyMeetings(mym => Array.isArray(mym) ? [...mym, assignMeetingInfo] : [assignMeetingInfo])
        setMeetingsReqs(reqs => reqs.filter(r => r.meetingId != assignMeetingInfo.meetingId))
        setAssignMeetingInfo(null)
    }


    return (
        <div className={props.onMobile ? "sb-assign-meeting-mobile-container" : "sb-assign-meeting-container"} >
            {JSON.stringify(assignMeetingInfo)}
            <button onClick={handleAssignment} >assign</button>
            <button onClick={() => { handleAssignment("close") }} >x</button>
        </div>
    );
}

export default SBAssignMeeting;