import React, { useContext, useState } from 'react';
import { isBrowser } from 'react-device-detect';

import moment from 'moment'

import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext';

import Auth from '../modules/auth/Auth';
import { assignSB, dateWTimeFormatChange, updateMaxDurationAndAssign, updateMaxRouteLengthAndAssign, checkDateBlock } from '../fetch_and_utils';
import { CONSTS } from '../consts/const_messages';

const assign_error = "אירעה שגיאה, לא ניתן להשתבץ כעת, עמכם הסליחה"

const SBAssignMeeting = ({ history, inRoute }) => {

    const { openGenAlert } = useContext(MainContext)
    const { userData,
        assignMeetingInfo, setAssignMeetingInfo,
        myMeetings, setMyMeetings,
        genMapMeetings, setGenMapMeetings,
        meetingsReqs, setMeetingsReqs,
        setIsInRoute,
        getLengthFromPrevStop
    } = useContext(SBContext)

    const [openAssign, setOpenRouteList] = useState(true)

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

    const handleAssignment = async (close) => {
        if (close === "close") {
            closeAssign()
            return;
        }

        const userStartTime = new Date(userData.startTime).getTime()
        const userEndTime = userStartTime + userData.maxRouteDuration;
        const myRoute = [];
        let meetingStartTime;
        //fill myRoute (without const meetings)
        for (let i in myMeetings) {
            meetingStartTime = new Date(myMeetings[i].startTime).getTime()
            if (!myMeetings[i].constMeeting || (meetingStartTime > userStartTime && meetingStartTime < userEndTime)) {
                myRoute.push(myMeetings[i])
            }
        }

        if (myRoute.length == userData.can_blow_x_times) {
            //! MAX_ROUTE_LENGTH
            handleMaxRouteLength(userData.can_blow_x_times)
            return;
        }
        if (myRoute.length == 20) {
            //! MAX_ROUTE_LENGTH_20
            openGenAlert({ text: "לא ניתן להשתבץ ליותר מ20 תקיעות", isPopup: { okayText: "הבנתי" } })
            return
        }

        openGenAlert({ text: "..." })
        //ASSIGN --START
        assignSB(assignMeetingInfo, (error, res) => {
            if (error || !res) {
                openGenAlert({ text: typeof error === "string" ? error : assign_error })
                return;
            }
            else if (res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר להשתבץ' });
                return;
            }
            checkAssignResForError(res)
        })
        //ASSIGN --END
    }
    const checkAssignResForError = (res) => {
        if (res && typeof res === "object" && typeof res.errName === "string") { //actually an error. (It's in res on purpose, so I have control over it)
            if (res.errName === "MAX_DURATION" && res.errData && res.errData.newTotalTime !== null && res.errData.newTotalTime !== undefined && res.errData.maxRouteDuration !== undefined && res.errData.maxRouteDuration !== null) {
                //! MAX_DURATION
                handleMaxDuration(res.errData)
                return;
            }
            else if (res.errName === "MAX_ROUTE_LENGTH" && res.errData && res.errData.currRouteLength !== null && res.errData.currRouteLength !== undefined) {
                //! MAX_ROUTE_LENGTH
                handleMaxRouteLength(res.errData.currRouteLength)
                return
            }
            else if (res.errName === "MAX_ROUTE_LENGTH_20" && res.errData && res.errData.currRouteLength !== null && res.errData.currRouteLength !== undefined) {
                //! MAX_ROUTE_LENGTH_20
                openGenAlert({ text: "לא ניתן להשתבץ ליותר מ20 תקיעות", isPopup: { okayText: "הבנתי" } })
                return
            }
            else openGenAlert({ text: assign_error })
        }
        else if (typeof res === "object" && !isNaN(Number(res.meetingId)) && !isNaN(Number(res.isPublicMeeting))) handleAssignSuccess(res) //RES (need new meeting info to update myMeetings)
        else openGenAlert({ text: assign_error })
    }

    const handleMaxRouteLength = (n) => {
        let text = `מספר התקיעות הנוכחי שלך הוא ${n} וציינת שאתה תוקע ${n} פעמים, לכן לא ניתן כעת לשבצך`
        openGenAlert({ text, isPopup: { okayText: "עדכן את מספר התקיעות שלי", cancelText: "סגור" } },
            updateRouteLength => {
                if (!updateRouteLength) {
                    return;
                }
                if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
                    openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את מספר התקיעות', block: true })
                    return;
                }
                updateMaxRouteLengthAndAssign(assignMeetingInfo,
                    (error, res) => {
                        if (error || !res) {
                            console.log('updateMaxDurationAndAssign err: ', error);
                            openGenAlert({ text: typeof error === "string" ? error : assign_error })
                            return;
                        }
                        else if (res && res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                            openGenAlert({ text: res, block: true })
                            return;
                        }
                        checkAssignResForError(res)
                    })
            })
    }

    const handleMaxDuration = (data) => {
        //format
        let newTT = data.newTotalTime;
        try {
            newTT = Number(newTT) / 60000
            let newTTSplit = newTT.toString().split(".")
            newTT = `${newTTSplit[0]}.${newTTSplit[1].substring(0, 2).padEnd(2, 0)}`
        } catch (e) { newTT = Number(newTT) / 60000 }

        let maxDur = data.maxRouteDuration
        try {
            maxDur = moment(Number(data.maxRouteDuration)).format("mm.ss")
        } catch (e) { maxDur = Number(data.maxRouteDuration) / 60000 }
        //format end

        let text = `זמן המסלול לאחר השיבוץ שלך יהיה ${newTT} דקות וציינת שזמן המסלול המקסימלי שלך הינו ${maxDur} דקות, לכן לא ניתן כעת לשבצך`
        openGenAlert({ text: text, isPopup: { okayText: "עדכון זמן ההליכה", cancelText: "סגור" } },
            updateMaxRouteDuration => {
                if (!updateMaxRouteDuration) {
                    return;
                }
                updateMaxDurationAndAssign(assignMeetingInfo, data.newTotalTime,
                    err => {
                        if (err) {
                            if (err === CONSTS.CURRENTLY_BLOCKED_ERR) {
                                openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן להשתבץ יותר' });
                                return;

                            }
                            openGenAlert({ text: typeof err === "string" ? err : assign_error })
                            return;
                        }
                        handleAssignSuccess(assignMeetingInfo)
                    })
            })
        return;
    }

    const handleAssignSuccess = (newMeeting) => {
        openGenAlert({ text: "שובצת בהצלחה" })
        closeAssign()

        //LOCAL STATE UPDATE WITH NEW MEETING --START
        if (!myMeetings.includes(newMeeting)) {
            setMyMeetings(mym => Array.isArray(mym) ? [...mym, newMeeting] : [newMeeting])
        }
        setMeetingsReqs(reqs => reqs.filter(r => r.meetingId != newMeeting.meetingId))

        if (!genMapMeetings) return
        if (newMeeting.isPublicMeeting && Array.isArray(genMapMeetings.publicMeetings)) {
            setGenMapMeetings(genMeets => ({ privateMeetings: genMeets.privateMeetings, publicMeetings: Array.isArray(genMeets.publicMeetings) ? [...genMeets.publicMeetings, newMeeting] : [newMeeting] }))
        }
        else if (Array.isArray(genMapMeetings.publicMeetings)) {
            setGenMapMeetings(genMeets => ({ publicMeetings: genMeets.publicMeetings, privateMeetings: Array.isArray(genMeets.privateMeetings) ? [...genMeets.publicMeetings, newMeeting] : [newMeeting] }))
        }

        //LOCAL STATE (genMeetings and myMeetings) UPDATE WITH NEW MEETING --END
    }




    const deleteMeeting = () => {
        if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            openGenAlert({ text: "מועד התקיעה מתקרב, לא ניתן יותר למחוק את הפגישה", block: true });
            return;
        }

        openGenAlert({ text: `האם את/ה בטוח/ה שברצונך למחוק פגישה זו ממסלולך? ${assignMeetingInfo && assignMeetingInfo.signedCount ? `ישנם ${assignMeetingInfo.signedCount} המחובר/ים לפגישה` : ""}`, isPopup: { okayText: "מחק", cancelText: "בטל, השאר את התקיעה" } },
            async del => {
                if (!del) return;
                let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/deleteMeeting`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({ meetToDelete: assignMeetingInfo })
                });
                if (err || !res) { //open alert of something went wrong
                    openGenAlert({ text: "אירעה שגיאה, אנא נסו שנית מאוחר יותר" })
                }
                if (res) {
                    if (res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                        openGenAlert({ text: "מועד התקיעה מתקרב, לא ניתן יותר למחוק את הפגישה" })
                        return;
                    }
                    openGenAlert({ text: "הפגישה הוסרה ממסלולך בהצלחה" })
                    setMyMeetings(myMeetings.filter(meet => meet.meetingId != assignMeetingInfo.meetingId))
                    setMeetingsReqs(meetList => Array.isArray(meetList) ? [...meetList, assignMeetingInfo] : [assignMeetingInfo])

                    if (genMapMeetings) {
                        if (assignMeetingInfo.isPublicMeeting && Array.isArray(genMapMeetings.publicMeetings)) {
                            setGenMapMeetings(genMeets => ({ ...genMeets, publicMeetings: genMeets.publicMeetings.filter(m => m.meetingId != assignMeetingInfo.meetingId) }))
                        }
                        else if (Array.isArray(genMapMeetings.privateMeetings)) {
                            setGenMapMeetings(genMeets => ({ ...genMeets, privateMeetings: genMeets.privateMeetings.filter(m => m.meetingId != assignMeetingInfo.meetingId) }))
                        }
                    }
                    handleAssignment('close');
                }
            })
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
    const block = checkDateBlock('DATE_TO_BLOCK_BLOWER')
    const startDate = new Date(assignMeetingInfo.startTime)
    const walkDuration = getLengthFromPrevStop(assignMeetingInfo.meetingId, assignMeetingInfo.isPublicMeeting)
    return (
        <div className={`${isBrowser ? "sb-assign-container" : "sb-assign-mobile-container"} ${openAssign ? "open-animation" : "close-animation"}`} id="sb-assign-container" >

            <div id="assign-x-btn-cont" style={{ margin: isBrowser ? "6% 0" : "3% 0" }} >
                <img alt="" src="/icons/close.svg" id="assign-x-btn" onClick={() => { handleAssignment("close") }} />
            </div>

            <div className="assign-title-container" style={{ marginBottom: isBrowser ? "6%" : "3%", marginTop: isBrowser ? "3%" : "3%" }} >
                <div id="assign-title" style={{ marginBottom: isBrowser ? "10%" : "5%" }} className="width100" >{inRoute ? 'אלו הם פרטי מפגש תקיעת שופר' : 'שיבוץ תקיעה בשופר'}</div>

                <div id="assign-icon-and-text-cont" className="width100" >
                    <img alt="" id="assign-icon" src={iconSrc} />
                    <div id="assign-text" >{iconText}</div>
                </div>
                {inRoute && assignMeetingInfo.isPublicMeeting ? <div id="signedCount">{assignMeetingInfo.signedCount ? assignMeetingInfo.signedCount === 1 ? `רשום אחד לתקיעה` : `${assignMeetingInfo.signedCount} רשומים לתקיעה` : "טרם קיימים רשומים לתקיעה"}</div> : null}
            </div>

            <div style={{ margin: isBrowser ? "10% 0" : "2% 0" }} className="sb-assign-content-container">
                <div className="inputDiv" id="meeting-name" >{assignMeetingInfo.isPublicMeeting ? "תקיעה ציבורית" : assignMeetingInfo.name}</div>
                {assignMeetingInfo.isPublicMeeting ? null : < div className={`inputDiv ${!assignMeetingInfo.phone ? 'no-value-text' : ''}`} id="meeting-phone" >{assignMeetingInfo.phone ? assignMeetingInfo.phone : 'אין מספר פלאפון להציג'}</div>}
                <div className="inputDiv" id="meeting-address" >{assignMeetingInfo.address}</div>
                {assignMeetingInfo.startTime ? <><div className="inputDiv" style={{ marginBottom: "0" }} >{`${startDate.toLocaleDateString("en-US")}, ${startDate.getHours().toString().padStart(2, 0)}:${startDate.getMinutes().toString().padStart(2, 0)}`}</div><div style={{ marginBottom: "5%" }}>ייתכנו שינויי בזמני התקיעות</div></> : null}
                <div className={`inputDiv ${gotComments ? "" : "no-value-text"}`} id="meeting-comments" >{gotComments ? assignMeetingInfo.comments : "אין הערות"}</div>
                {inRoute && walkDuration ? <div className="walk-duration" >{`זמן הליכה מהנקודה הקודמת ${walkDuration}`}</div> : null}
            </div>

            {block ? null : (inRoute ? <div className="delete-meeting clickAble" style={{ marginTop: isBrowser ? "10%" : "5%" }} onClick={deleteMeeting}>הסירו את מפגש התקיעה מהמסלול שלי ומהמאגר</div> : <button id="assign-btn" style={{ marginTop: isBrowser ? "10%" : "5%" }} onClick={() => { handleAssignment() }} >שבץ אותי</button>)}
        </div>
    );
}

export default SBAssignMeeting;