import React, { useContext } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';

import { MainContext } from '../ctx/MainContext';

const SBAssignMeeting = (props) => {
    const { openGenAlert } = useContext(MainContext)
    const { assignMeetingInfo, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        meetingsReqs, setMeetingsReqs,
        assigns, setAssigns,
    } = useContext(SBContext)
    const { userInfo: userData } = useContext(MainContext)

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
        if (!myMeetings.includes(assignMeetingInfo)) setMyMeetings(mym => Array.isArray(mym) ? [...mym, assignMeetingInfo] : [assignMeetingInfo])
        setMeetingsReqs(reqs => reqs.filter(r => r.meetingId != assignMeetingInfo.meetingId))
        setAssignMeetingInfo(null)
    }


    return (
        <div>
            {JSON.stringify(assignMeetingInfo)}
            <button onClick={handleAssignment} >assign</button>
            <button onClick={() => { handleAssignment("close") }} >x</button>
        </div>
    );
}

export default SBAssignMeeting;