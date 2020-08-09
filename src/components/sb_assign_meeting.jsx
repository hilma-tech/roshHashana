import React, { useContext, useState } from 'react';
import { isBrowser } from 'react-device-detect';

import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext';

import { assignSB } from '../fetch_and_utils';
import { CONSTS } from '../consts/const_messages';
import { useEffect } from 'react';
import { getOverviewPath } from './maps/get_overview_path';

const assign_error = "אירעה שגיאה, לא ניתן להשתבץ כעת, עמכם הסליחה"

const SBAssignMeeting = (props) => {
    const { openGenAlert } = useContext(MainContext)
    const { userData,
        assignMeetingInfo, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        meetingsReqs, setMeetingsReqs,
        startTimes, totalTime
    } = useContext(SBContext)

    const [openAssign, setOpenRouteList] = useState(true)

    useEffect(() => {
        const script = document.createElement('script')
        script.async = true;
        script.defer = true;
        script.id = "mapScriptHi";
        script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`
        document.head.appendChild(script);
        return () => {
            let script = document.getElementById('mapScriptHi')
            document.head.removeChild(script);
        }
    }, [])


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

    const calcTotalNewTime = (obj) => {
        if (!obj.startTimes || !Array.isArray(obj.startTimes)) return null
        const totalTime = obj.startTimes.reduce((accumulator, st) => st.duration && st.duration.value ? (accumulator + Number(st.duration.value)) : null, 0) * 1000
        return totalTime;
    }


    const handleAssignment = async (close) => {
        if (close === "close") {
            closeAssign()
            return;
        }
        //set new route and remove meetingId from reqs array
        if (myMeetings.length == userData.can_blow_x_times) {
            openGenAlert({ text: `מספר התקיעות הנוכחי שלך הוא ${myMeetings.length} וציינת שאתה תוקע ${userData.can_blow_x_times}, לכן לא ניתן כעת לשבצך`, isPopup: { okayText: "הבנתי" } })
            return;
        }
        openGenAlert({ text: "..." })


        if (!window.google || !window.google.maps) {
            openGenAlert({ text: assign_error });
            console.log('no window.google || no window.google.maps');
            return;
        }
        const newStops = (Array.isArray(myMeetings) && myMeetings.length) ? [...myMeetings, assignMeetingInfo] : assignMeetingInfo
        debugger
        let [errOP, resOP] = await getOverviewPath(window.google, { lat: Number(userData.lat), lng: Number(userData.lng) }, newStops, { getTimes: true, userData })
        debugger
        if (errOP) {
            console.log('errOP: ', errOP);
            openGenAlert({ text: assign_error })
            return;
        }
        const newTotalTime = calcTotalNewTime(resOP)
        debugger

        if (!newTotalTime) {
            console.log('no newTotalTime : ', newTotalTime);
            openGenAlert({ text: assign_error })
            return
        }

        // CHECK MAX TOTAL TIME LENGTH with CURRENT TOTAL TIME --START
        if (userData && userData.maxRouteDuration && newTotalTime && newTotalTime > userData.maxRouteDuration) {
            openGenAlert({ text: `זמן המסלול לאחר השיבוץ שלך יהיה ${newTotalTime / 60000} דקות וציינת שזמן המסלול המקסימלי שלך הינו ${userData.maxRouteDuration / 60000} דקות, לכן לא ניתן כעת לשבצך`, isPopup: { okayText: "הבנתי" } })
            return;
        }
        // CHECK MAX TOTAL TIME LENGTH with CURRENT TOTAL TIME --END

        //LOCAL STATE UPDATE WITH NEW MEETING --START
        if (!myMeetings.includes(assignMeetingInfo)) setMyMeetings(mym => Array.isArray(mym) ? [...mym, assignMeetingInfo] : [assignMeetingInfo])
        setMeetingsReqs(reqs => reqs.filter(r => r.meetingId != assignMeetingInfo.meetingId))
        //LOCAL STATE UPDATE WITH NEW MEETING --END

        //ASSIGN --START
        const newAssignMeetingObj = { meetingId: assignMeetingInfo.meetingId, isPublicMeeting: assignMeetingInfo.isPublicMeeting, startTime: resOP.startTimes[resOP.startTimes.length - 1].startTime }
        assignSB([newAssignMeetingObj], (error, res) => {
            if (error || !res) openGenAlert({ text: typeof error === "string" ? error : "קרתה תקלה, נא השתבצו מאוחר יותר, תודה" })
            else if (Array.isArray(res)) {
                let success = true
                for (let i in res) {
                    if (!res[i] || !res[i].success) {
                        openGenAlert({ text: "חלק מהשיבוצים נכשלו" })
                        success = false
                        break;
                    }
                }
                if (success) {
                    openGenAlert({ text: "שובצת בהצלחה" })
                }
            }
            else openGenAlert({ text: "שובצת בהצלחה" })
            closeAssign()
        })
        //ASSIGN --END

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