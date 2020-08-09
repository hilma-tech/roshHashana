import React, { useContext, useState } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';

import { MainContext } from '../ctx/MainContext';
import { isBrowser } from 'react-device-detect';

const SBAssignMeeting = (props) => {
    const { openGenAlert } = useContext(MainContext)
    const { userData,
        assignMeetingInfo, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        meetingsReqs, setMeetingsReqs,
        assigns, setAssigns,
    } = useContext(SBContext)

    const [openAssign, setOpenRouteList] = useState(true)

    if (!assignMeetingInfo || typeof assignMeetingInfo !== "object") {
        props.history.push('/')
        return;
    }

    const closeAssign = () => {
        if (isBrowser) {
            setAssignMeetingInfo(null)
            return
        }
        setOpenRouteList(false)
        setTimeout(() => { setAssignMeetingInfo(null) }, 400)
    }


    const handleAssignment = async (close) => {
        if (close === "close") {
            closeAssign()
            return;
        }
        //set new route and remove meetingId from reqs array
        if (myMeetings.length == userData.can_blow_x_times) {
            openGenAlert({ text: `מספר התקיעות הנוכחי שלך הוא ${myMeetings.length} וציינת שאתה תוקע ${userData.can_blow_x_times}, לכן לא ניתן כעת לשבץ`, isPopup: { okayText: "הבנתי" } })
            return;
        }
        openGenAlert({ text: "..." })
        setAssigns(a => Array.isArray(a) ? [...a, assignMeetingInfo] : [assignMeetingInfo])
        if (!myMeetings.includes(assignMeetingInfo)) setMyMeetings(mym => Array.isArray(mym) ? [...mym, assignMeetingInfo] : [assignMeetingInfo])
        setMeetingsReqs(reqs => reqs.filter(r => r.meetingId != assignMeetingInfo.meetingId))
        closeAssign()
    }

    let iconSrc;
    let iconText;
    if (assignMeetingInfo.isPublicMeeting) {
        iconSrc = "/icons/group-orange.svg"
        iconText = "תקיעה ציבורית"
    }
    else {
        iconSrc = "/icons/single-blue.svg"
        iconText = "תקיעה פרטית"
    }

    const gotComments = assignMeetingInfo.comments && typeof assignMeetingInfo.comments === "string" && assignMeetingInfo.comments.length && assignMeetingInfo.comments.split(" ").join("").length

    return (
        <div className={`${isBrowser ? "sb-assign-container" : "sb-assign-mobile-container"} ${openAssign ? "open-animation" : "close-animation"}`} id="sb-assign-container" >

            <div id="assign-x-btn-cont" >
                <img src="/icons/close.svg" id="assign-x-btn" onClick={() => { handleAssignment("close") }} />
            </div>

            <div>
                <div id="assign-title" className="width100" >{!props.notAssign ? 'אלו הם פרטי מפגש תקיעת שופר' : 'שיבוץ תקיעה בשופר'}</div>

                <div id="assign-icon-and-text-cont" className="width100" >
                    <img id="assign-icon" src={iconSrc} />
                    <div id="assign-text" >{iconText}</div>
                </div>
            </div>

            <div className="sb-assign-content-container">
                <div className="input-div" id="meeting-name" >{assignMeetingInfo.isPublicMeeting ? "תקיעה ציבורית" : assignMeetingInfo.name}</div>
                {assignMeetingInfo.isPublicMeeting ? null : < div className={`input-div ${!assignMeetingInfo.phone ? 'no-value-text' : ''}`} id="meeting-phone" >{assignMeetingInfo.phone ? assignMeetingInfo.phone : 'אין מספר פלאפון להציג'}</div>}
                <div className="input-div" id="meeting-address" >{assignMeetingInfo.address}</div>
                <div className={`input-div ${gotComments ? "" : "no-value-text"}`} id="meeting-comments" >{gotComments ? assignMeetingInfo.comments : "אין הערות"}</div>
            </div>

            {!props.notAssign ? <div className="delete-meeting clickAble">הסירו את מפגש התקיעה מהמסלול שלי ומהמאגר</div> : <button id="assign-btn" onClick={() => { handleAssignment() }} >שבץ אותי</button>}
        </div>
    );
}

export default SBAssignMeeting;