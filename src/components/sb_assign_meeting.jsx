import React, { useContext, useState } from 'react';
import { isBrowser } from 'react-device-detect';
import Auth from '../modules/auth/Auth';
import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext';

import { assignSB } from '../fetch_and_utils';
import { CONSTS } from '../consts/const_messages';
import { useEffect } from 'react';
import { getOverviewPath } from './maps/get_overview_path';

const assign_error = "אירעה שגיאה, לא ניתן להשתבץ כעת, עמכם הסליחה"


const getConstMeetings = (MyMeetings, userData) => {
    const userStartTime = new Date(userData.startTime).getTime()
    const userEndTime = userStartTime + userData.maxRouteDuration;
    const routeStops = [];
    const constStopsB4 = [];
    const constStopsAfter = [];
    let meetingStartTime;

    //fill routeStops, constStopsb4 and constStopsAfter
    for (let i in MyMeetings) {
        meetingStartTime = new Date(MyMeetings[i].startTime).getTime()
        if (MyMeetings[i].constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)) {
            // is a meeting set by sb and is not part of blowing route (is before sb said he starts or after his route finishes)
            if (meetingStartTime < userStartTime) {
                constStopsB4.push(MyMeetings[i])
            } else {
                // console.log('pushing as a AFTER const stop: ', MyMeetings[i]);
                constStopsAfter.push(MyMeetings[i])
            }
        }
        else routeStops.push(MyMeetings[i])
    }
    return { routeStops, constStopsB4, constStopsAfter }
}


const SBAssignMeeting = ({ history, inRoute }) => {

    const { openGenAlert } = useContext(MainContext)
    const { userData,
        assignMeetingInfo, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        meetingsReqs, setMeetingsReqs,
        setIsInRoute,
        startTimes, totalTime
    } = useContext(SBContext)

    const [openAssign, setOpenRouteList] = useState(true)

    const addGoogleMaps = () => {
        const script = document.createElement('script')
        script.async = true;
        script.defer = true;
        script.id = "mapScriptHi";
        script.src = `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`
        document.head.appendChild(script);
    }
    const removeGoogleMaps = () => {
        let script = document.getElementById('mapScriptHi')
        document.head.removeChild(script);
    }


    if (!assignMeetingInfo || typeof assignMeetingInfo !== "object") {
        history.push('/')
        return;
    }

    const closeAssign = () => {
        if (isBrowser) {
            setAssignMeetingInfo(null)
            setIsInRoute(false);
            return
        }
        setOpenRouteList(false)
        setTimeout(() => { setAssignMeetingInfo(null) }, 400)
    }

    const calcTotalNewTime = (obj) => {
        if (!obj.startTimes || !Array.isArray(obj.startTimes)) return null
        let totalTime = obj.startTimes.reduce((accumulator, st) => st.duration && st.duration.value ? (accumulator + Number(st.duration.value)) : null, 0) * 1000
        console.log('totalTime: ', totalTime);
        let newTotalTime = Number(totalTime) / 60000
        try {
            let splitTT = newTotalTime.toString().split(".")
            newTotalTime = `${splitTT[0]}.${typeof splitTT[1] === "string" ? splitTT[1].substring(0, 2) : "00"}`
            console.log('newTotalTime: ', newTotalTime);
        } catch (e) { newTotalTime = totalTime }
        return newTotalTime;
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
        // newStops should be without const meetings!
        const { routeStops, constStopsB4, constStopsAfter } = getConstMeetings(myMeetings, userData)
        const newStops = (Array.isArray(routeStops) && routeStops.length) ? [...routeStops, assignMeetingInfo] : assignMeetingInfo

        
        addGoogleMaps()
        let [errOP, resOP] = await getOverviewPath(window.google, { lat: Number(userData.lat), lng: Number(userData.lng) }, newStops, { getTimes: true, userData })
        removeGoogleMaps()

        if (errOP) {
            console.log('errOP: ', errOP);
            openGenAlert({ text: assign_error })
            return;
        }
        const newTotalTime = calcTotalNewTime(resOP)

        if (!newTotalTime) {
            console.log('no newTotalTime : ', newTotalTime);
            openGenAlert({ text: assign_error })
            return
        }

        // CHECK MAX TOTAL TIME LENGTH with CURRENT TOTAL TIME --START
        if (userData && userData.maxRouteDuration && newTotalTime && newTotalTime > userData.maxRouteDuration) {
            openGenAlert({ text: `זמן המסלול לאחר השיבוץ שלך יהיה ${newTotalTime} דקות וציינת שזמן המסלול המקסימלי שלך הינו ${userData.maxRouteDuration / 60000} דקות, לכן לא ניתן כעת לשבצך`, isPopup: { okayText: "הבנתי" } })
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

    const deleteMeeting = async () => {
        let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/deleteMeeting`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ meetToDelete: assignMeetingInfo })
        });
        if (err || !res) { //open alert of something went wrong
            openGenAlert({ text: "אירעה שגיאהת אנא נסו שנית מאוחר יותר" })
        }
        if (res) {
            openGenAlert({ text: "הפגישה נמחקה בהצלחה" })
            setMyMeetings(myMeetings.filter(meet => meet.meetingId !== assignMeetingInfo.meetingId))
            handleAssignment('close');
        }
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
                <div id="assign-title" className="width100" >{inRoute ? 'אלו הם פרטי מפגש תקיעת שופר' : 'שיבוץ תקיעה בשופר'}</div>

                <div id="assign-icon-and-text-cont" className="width100" >
                    <img id="assign-icon" src={iconSrc} />
                    <div id="assign-text" >{iconText}</div>
                </div>
            </div>

            <div className="sb-assign-content-container">
                <div className="inputDiv" id="meeting-name" >{assignMeetingInfo.isPublicMeeting ? "תקיעה ציבורית" : assignMeetingInfo.name}</div>
                {assignMeetingInfo.isPublicMeeting ? null : < div className={`inputDiv ${!assignMeetingInfo.phone ? 'no-value-text' : ''}`} id="meeting-phone" >{assignMeetingInfo.phone ? assignMeetingInfo.phone : 'אין מספר פלאפון להציג'}</div>}
                <div className="inputDiv" id="meeting-address" >{assignMeetingInfo.address}</div>
                <div className={`inputDiv ${gotComments ? "" : "no-value-text"}`} id="meeting-comments" >{gotComments ? assignMeetingInfo.comments : "אין הערות"}</div>
            </div>

            {inRoute ? <div className="delete-meeting clickAble" onClick={deleteMeeting}>הסירו את מפגש התקיעה מהמסלול שלי ומהמאגר</div> : <button id="assign-btn" onClick={() => { handleAssignment() }} >שבץ אותי</button>}
        </div>
    );
}

export default SBAssignMeeting;