import React, { useState, useContext, useEffect } from 'react'

import { AdminMainContext } from './ctx/AdminMainContext';

import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ShofarBlowerMap from '../../components/maps/shofar_blower_map'
import SBRouteList from '../../components/sb_route_list';
import { adminGetSBRoute, adminAssignSBToIsolator, adminUpdateMaxDurationAndAssign, adminUpdateMaxRouteLengthAndAssign, fetchIsolatedForMap } from './fetch_and_utils';
import { MainContext } from '../../ctx/MainContext';

const assign_default_error = "אירעה שגיאה, לא ניתן לשבץ כעת, עמכם הסליחה"


const SingleShofarBlowerPage = (props) => {
    const [meetingsOfSelectedSB, setMeetingsOfSelectedSB] = useState(null)
    const [assigned, setAssigned] = useState(false)
    const [showIsolators, setShowIsolators] = useState(false)
    const [isolators, setIsolatorsLocations] = useState([])

    const { selectedSB, setSelectedSB, totalLength,
        selectedIsolator, setSelectedIsolator // came from isolator
    } = useContext(AdminMainContext)
    const { openGenAlert, openGenAlertSync } = useContext(MainContext)

    useEffect(() => {
        if (!selectedSB) { return }

        // console.log('selectedSB: ', selectedSB);
        if (selectedIsolator || (!selectedIsolator && selectedSB))
            fetchAdminSBRoute(selectedSB.userId, selectedIsolator || (!selectedSB.phone && !selectedSB.username) || !selectedSB.can_blow_x_times || !selectedSB.volunteering_start_time || !selectedSB.volunteering_max_time)
        //if selectedSB(:obj) has .id --> came from shofar-blowers-table
        //else, if has .sbId --> came from home-page-map
        //else, if isFromIsolator --> came from searchera and selectedSB is a num (an id)
        //todo: check if this workd ^, coming from : map/shofarBlowers/searcher
        return () => {
            cleanUp()
        }
    }, [])

    if ((selectedIsolator && !selectedSB) || (!selectedIsolator && (!selectedSB || selectedSB === null))) { //if came from shofar blower page-table but we don't have a selected sb -- redirect to shofar blowers page-table
        if (props.history && props.history.goBack) { assigned ? props.history.push('searching') : props.history.goBack(); return null } else return <div>אנא לחזור לעמוד הקודם, תודה</div>
    }

    const cleanUp = () => {
        setSelectedSB(null);
        setAssigned(false)
    }

    const fetchAdminSBRoute = async (sbId, withSBInfo) => {
        let [errAdminRoute, resAdminRoute] = await adminGetSBRoute(sbId, withSBInfo)
        if (errAdminRoute || !resAdminRoute) {
            setMeetingsOfSelectedSB(true)
            return
        }
        if (withSBInfo) {
            setMeetingsOfSelectedSB(resAdminRoute.meetings)
            setSelectedSB(selectedSB => ({ selectedSB, ...resAdminRoute.sbData }))
        }
        else setMeetingsOfSelectedSB(resAdminRoute)
    }


    const handleXClick = () => {
        cleanUp()
    }
    const handleForceAssign = (va, iso) => { //lol
        if (va !== "PLEASE_TAKE_ME_I_CAME_FROM_SB_MAP_AND_HAVE_NO_SELECTED_ISOLATOR_COS_IT_IS_I" && (!selectedSB || !selectedIsolator || typeof selectedSB !== "object" || typeof selectedIsolator !== "object")) {
            openGenAlert({ text: "לא ניתן לשבץ" }); // not supposed to get here came to this page to assign (should get here only by mistake when not meaning to assign).. or when some data is missing bu mistake(idk)
            return
        }
        if (va === "PLEASE_TAKE_ME_I_CAME_FROM_SB_MAP_AND_HAVE_NO_SELECTED_ISOLATOR_COS_IT_IS_I" && (typeof iso !== "object" || !iso)) {
            openGenAlert({ text: "לא ניתן לשבץ" });
            return
        }
        if (va === "PLEASE_TAKE_ME_I_CAME_FROM_SB_MAP_AND_HAVE_NO_SELECTED_ISOLATOR_COS_IT_IS_I" && typeof iso === "object" && iso) {
            setSelectedIsolator(iso)
        }

        (async () => {
            console.log('adminAssignSBToIsolator: ', selectedIsolator || iso);
            let [assignErr, assignRes] = await adminAssignSBToIsolator(selectedSB, selectedIsolator || iso)
            if (assignErr || !assignRes) {
                openGenAlert({ text: assign_default_error })
                return
            }
            checkAssignResForError(assignRes)
        })()
    }
    const checkAssignResForError = (assignRes) => {
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
            else if (assignRes.errName === "MAX_DURATION_180") {
                openGenAlert({ text: "אורך מסלולך לאחר השיבוץ ארוך מדי, נא נסו להשתבץ לפגישה אחרת", isPopup: { okayText: "הבנתי" } })
                return;
            }
            else openGenAlert({ text: assign_default_error })
        }
        else if (typeof assignRes === "object" && assignRes) handleAssignSuccess(assignRes) //RES (need new meeting for local update)
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
                handleAssignSuccess()//shouldn't get MAX_ROUTE_LENGTH error now, cos validation is first on that and then on max duration
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
                    openGenAlert({ text: typeof error === "string" ? error : assign_default_error })
                    return;
                }
                // else if (res && res === CONSTS.CURRENTLY_BLOCKED_ERR) { openGenAlert({ text: res, block: true }); return; }
                checkAssignResForError(res) //res might contain a MAX_DURATION error
            })
    }

    const handleAssignSuccess = (assignRes) => {
        openGenAlert({ text: "שובץ בהצלחה" });
        setAssigned(true)
        if (showIsolators && Array.isArray(isolators)) {
            setIsolatorsLocations(isos => isos.filter(i => i.id != assignRes.id || i.isPublicMeeting != assignRes.isPublicMeeting))
        }
        setMeetingsOfSelectedSB(route => (Array.isArray(route) ? [...route, selectedIsolator || assignRes] : [selectedIsolator || assignRes]))
    }

    const showIsolatorsMarkers = () => {
        setShowIsolators(s => !s)
        if (isolators.length > 0) return
        fetchIsolatedForMap((err, res) => {
            if (!err && Array.isArray(res)) {
                setIsolatorsLocations(res)
            } else openGenAlert({ text: "אירעה שגיאה, לא ניתן להציג את רשימת המחפשים כעת" })
        })
    }

    // let ttlength = "100 מטרים"
    let ttlength = totalLength || 0 + " מטרים"
    let tooltipText = `עד ${selectedSB.can_blow_x_times == 1 ? "תקיעה אחת" : (selectedSB.can_blow_x_times + " תקיעות בשופר")}\nעד ${selectedSB.volunteering_max_time} דקות הליכה`

    return (
        <div className="single-shofar-blower-page">
            <div id="top" >
                <FontAwesomeIcon id="x-btn" icon={['fas', 'times']} className='pointer' onClick={handleXClick} />
                <div id="title" >{`מפת תקיעות השופר של - ${selectedSB && selectedSB.name || ""}`}</div>
            </div>
            {(selectedIsolator && !assigned) ? null : <div className='mapNavContainer' id="mapNavContainer-in-shofar-blower-map">
                <div className={'mapIconContainer orangeText pointer' + (showIsolators ? ' mapIconSelected' : '')} onClick={showIsolatorsMarkers}>
                    <img src='icons/singleOrange.svg' alt='' />
                    <div className='textInHover orangeBackground bold'>מחפשים</div>
                </div>
            </div>}
            <div id='map-and-info'>
                <div id="side-info-container">
                    <div id="about-sb">
                        <div id="name-and-phone">
                            <div>{selectedSB.name}</div>
                            <div>{selectedSB.username || selectedSB.phone}</div>
                        </div>
                        <div id="more-info-container">
                            <div id='more-info-tooltip'>{tooltipText}</div>
                            <FontAwesomeIcon id="info-icon" className="pointer" icon="info-circle" />
                        </div>
                    </div>
                    <div id="total-length">{`משך הליכה כולל: ${ttlength} מטרים`}</div>
                    <SBRouteList admin selectedSB={selectedSB} meetingsOfSelectedSB={meetingsOfSelectedSB} setMeetingsOfSelectedSB={setMeetingsOfSelectedSB} />
                </div>
                {!selectedSB || selectedSB === null || !meetingsOfSelectedSB ? null : (Array.isArray(meetingsOfSelectedSB) && typeof selectedSB === "object" ?
                    <ShofarBlowerMap
                        admin
                        handleForceAssign={handleForceAssign}
                        assigned={assigned}
                        selectedSB={selectedSB}
                        selectedIsolator={!assigned && selectedIsolator}
                        meetingsOfSelectedSB={meetingsOfSelectedSB}
                        setMeetingsOfSelectedSB={setMeetingsOfSelectedSB}
                        showIsolators={showIsolators}
                        isolators={isolators}
                    /> : <div>אירעה שגיאה, נא נסו שנית מאוחר יותר</div>)}
            </div>
        </div>
    );
}

export default SingleShofarBlowerPage;