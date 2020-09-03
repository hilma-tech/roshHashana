import React, { useState, useContext, useEffect } from 'react'

import { AdminMainContext } from './ctx/AdminMainContext';

import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ShofarBlowerMap from '../../components/maps/shofar_blower_map'
import SBRouteList from '../../components/sb_route_list';
import { adminGetSBRoute, adminAssignSBToIsolator, adminUpdateMaxDurationAndAssign } from './fetch_and_utils';
import { assignSB } from '../../fetch_and_utils';
import { MainContext } from '../../ctx/MainContext';

const assign_default_error = "אירעה שגיאה, לא ניתן לשבץ כעת, עמכם הסליחה"


const SingleShofarBlowerPage = (props) => {
    const [meetingsOfSelectedSB, setMeetingsOfSelectedSB] = useState(null)

    const { selectedSB, setSelectedSB, totalLength,
        isFromIsolator, selectedIsolator // came from isolator
    } = useContext(AdminMainContext)
    const { openGenAlert, openGenAlertSync } = useContext(MainContext)

    useEffect(() => {
        //if came from shofar blower page-table but we don't have a selected sb -- redirect to shofar blowers page-table
        if (!isFromIsolator && (!selectedSB || selectedSB === null)) { return }
        //if came from single isolater but has no selectedSB (=sbId) -- redirect to searcher (which might redirect to searchers)
        if (isFromIsolator && (!selectedSB || isNaN(Number(selectedSB)))) { return }

        (isFromIsolator || (!isFromIsolator && selectedSB)) && fetchAdminSBRoute(isFromIsolator ? selectedSB : selectedSB.id || selectedSB.sbId, selectedSB.sbId || isFromIsolator) //when came from shofar blowers, if don't have selectedSB, don't fetch
        //if selectedSB(:obj) has .id --> came from shofar-blowers-table
        //else, if has .sbId --> came from home-page-map
        //else, if isFromIsolator --> came from searchera and selectedSB is a num (an id)
        //todo: check if this workd ^, coming from : map/shofarBlowers/searcher

    }, [])

    if (!isFromIsolator && (!selectedSB || selectedSB === null)) { //if came from shofar blower page-table but we don't have a selected sb -- redirect to shofar blowers page-table
        if (props.history && props.history.push) { props.history.push("/shofar-blowers"); return null } else return <div>אנא לחזור לעמוד הקודם, תודה</div>
    }
    if (isFromIsolator && (!selectedSB || isNaN(Number(selectedSB)))) { //if came from single isolater but has no selectedSB (=sbId) -- redirect to searcher (which might redirect to searchers)
        if (props.history && props.history.push) { props.history.push("/searcher"); return null } else return <div>אנא לחזור לעמוד הקודם, תודה</div>
    }

    const fetchAdminSBRoute = async (sbId, withSBInfo) => {
        let [errAdminRoute, resAdminRoute] = await adminGetSBRoute(sbId, withSBInfo)
        if (errAdminRoute || !resAdminRoute) {
            setMeetingsOfSelectedSB(true)
        }
        if (withSBInfo) {
            setMeetingsOfSelectedSB(resAdminRoute.meetings)
            console.log('setMeetingsOfSelectedSB to: ', resAdminRoute.meetings);
            setSelectedSB(resAdminRoute.sbData)
            console.log('setSelectedSB to: ', resAdminRoute.sbData);
        }
        else setMeetingsOfSelectedSB(resAdminRoute)
    }

    const handleXClick = () => {
        props.history.goBack()
        // if (isFromIsolator) { props.history && props.history.push && props.history.push("/searcher") }
        // else {
        setSelectedSB(null);
        // props.history && props.history.push && props.history.push("/shofar-blowers")
        // }
    }
    const handleForceAssign = () => { //lol
        if (!isFromIsolator || !selectedSB || !selectedIsolator || typeof selectedSB !== "object" || typeof selectedIsolator !== "object") {
            openGenAlert({ text: "לא ניתן לשבץ" }); // not supposed to get here came to this page to assign (should get here only by mistake when not meaning to assign).. or when some data is missing bu mistake(idk)
            return
        }
        (async () => {
            console.log('handleForceAssign::');
            console.log('selectedSB, selectedIsolator: ', selectedSB, selectedIsolator);
            let [assignErr, assignRes] = await adminAssignSBToIsolator(selectedSB, selectedIsolator)
            console.log('1assignErr: ', assignErr);
            console.log('1assignRes: ', assignRes);
            if (assignErr || !assignRes) {
                openGenAlert({ text: assign_default_error })
                return
            }
            checkAssignResForError(assignRes)
        })()
    }
    const checkAssignResForError = (assignRes)=>{
        if (assignRes && typeof assignRes === "object" && typeof assignRes.errName === "string") { //actually an error. (It's in assignRes on purpose, so I have control over it)
        if (assignRes.errName === "MAX_DURATION" && assignRes.errData && assignRes.errData.newTotalTime !== null && assignRes.errData.newTotalTime !== undefined && assignRes.errData.maxRouteDuration !== undefined && assignRes.errData.maxRouteDuration !== null) {
            //! MAX_DURATION
            handleMaxDuration(assignRes.errData)
            return;
        }
        else if (assignRes.errName === "MAX_ROUTE_LENGTH" && assignRes.errData && assignRes.errData.currRouteLength !== null && assignRes.errData.currRouteLength !== undefined) {
            //! MAX_ROUTE_LENGTH
            handleMaxRouteLength(assignRes.errData.currRouteLength)
            return
        }
        else if (assignRes.errName === "MAX_ROUTE_LENGTH_20" && assignRes.errData && assignRes.errData.currRouteLength !== null && assignRes.errData.currRouteLength !== undefined) {
            //! MAX_ROUTE_LENGTH_20
            openGenAlert({ text: "לא ניתן להשתבץ ליותר מ20 תקיעות", isPopup: { okayText: "הבנתי" } })
            return
        }
        else openGenAlert({ text: assign_default_error })
    }
    else if (typeof assignRes === "object" /* && !isNaN(Number(assignRes.meetingId)) && !isNaN(Number(assignRes.isPublicMeeting)) */) handleAssignSuccess(assignRes) //RES (need new meeting for local update)
    else openGenAlert({ text: assign_default_error })
    }

    const handleMaxDuration = async (data) => {
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


        let text = `זמן המסלול של בעל התוקע לאחר השיבוץ יהיה ${newTT} דקות, והוא ציין שזמן המסלול המקסימלי שלו הינו ${maxDur} דקות, לכן לא ניתן כעת לבצע את השיבוץ`
        let updateMaxRouteDuration = await openGenAlertSync({ text: text, isPopup: { okayText: "עדכון זמן ההליכה ושיבוץ", cancelText: "סגור" } })
        if (!updateMaxRouteDuration) {
            return;
        }
        adminUpdateMaxDurationAndAssign(selectedSB, selectedIsolator, data.newTotalTime,
            err => {
                if (err) {
                    // if (err === CONSTS.CURRENTLY_BLOCKED_ERR) { openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן להשתבץ יותר' }); return; }
                    openGenAlert({ text: typeof err === "string" ? err : assign_default_error })
                    return;
                }
                handleAssignSuccess()
                //shouldn't get MAX_ROUTE_LENGTH error now, cos validation is first on that and then on max duration
            })
        return;
    }

    const handleMaxRouteLength = async (n) => {
        if (isNaN(Number(n))) return
        let text = `שים לב, לאחר השיבוץ מספר התקיעות של בעל התקיעה יעמוד על ${Number(n) + 1} תקיעות. בעל התקיעות קבע את ${n} כמספר התקיעות המקסימלי שלו`;
        // `מספר התקיעות הנוכחי שלך הוא ${n} וציינת שאתה תוקע ${n} פעמים, לכן לא ניתן כעת לשבצך`
        let updateRouteLength = await openGenAlertSync({ text, isPopup: { okayText: "עדכן הגדרה זו ושבץ", cancelText: "בטל" } })
        if (!updateRouteLength) {
            return;
        }
        // if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) { openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן לעדכן יותר את מספר התקיעות', block: true }); return; }
        adminUpdateMaxRouteLengthAndAssign(selectedSB, selectedIsolator,
            (error, res) => {
                if (error || !res) {
                    openGenAlert({ text: typeof error === "string" ? error : assign_error })
                    return;
                }
                else if (res && res === CONSTS.CURRENTLY_BLOCKED_ERR) {
                    openGenAlert({ text: res, block: true })
                    return;
                }
                checkAssignResForError(res) //res might contain a MAX_DURATION error
            })
    }

    const handleAssignSuccess = () => {
        openGenAlert({ text: "שובץ בהצלחה" })
    }

    // let ttlength = "100 מטרים"
    let ttlength = totalLength || 0 + " מטרים"
    let tooltipText = `עד ${selectedSB.can_blow_x_times == 1 ? "תקיעה אחת" : (selectedSB.can_blow_x_times + " תקיעות בשופר")}\nעד ${selectedSB.volunteering_max_time} דקות הליכה`

    return (
        <div className="single-shofar-blower-page">
            <div id="top" >
                <FontAwesomeIcon id="x-btn" icon={['fas', 'times']} className='pointer' onClick={handleXClick} />
                <div id="title" >{`מפת תקיעות השופר של - ${selectedSB && selectedSB.name}`}</div>
            </div>
            <div id='map-and-info'>
                <div id="side-info-container">
                    <div id="about-sb">
                        <div id="name-and-phone">
                            <div>{selectedSB.name}</div>
                            <div>{selectedSB.username}</div>
                        </div>
                        <div id="more-info-container">
                            <div id='more-info-tooltip'>{tooltipText}</div>
                            <FontAwesomeIcon id="info-icon" className="pointer" icon="info-circle" />
                        </div>
                    </div>
                    <div id="total-length">{`משך הליכה כולל: ${ttlength}`}</div>
                    <SBRouteList admin selectedSB={selectedSB} meetingsOfSelectedSB={meetingsOfSelectedSB} />
                </div>
                {!selectedSB || selectedSB === null || !meetingsOfSelectedSB ? null : (Array.isArray(meetingsOfSelectedSB) && typeof selectedSB === "object" ?
                    <ShofarBlowerMap admin selectedSB={selectedSB} selectedIsolator={selectedIsolator} meetingsOfSelectedSB={meetingsOfSelectedSB} /> : <div>אירעה שגיאה, נא נסו שנית מאוחר יותר</div>)}
                {!isFromIsolator && assignSB ?
                    null
                    :
                    <div onClick={handleForceAssign} id="assign-btn">שיבוץ בעל התוקע</div>
                }
            </div>
        </div>
    );
}

export default SingleShofarBlowerPage;