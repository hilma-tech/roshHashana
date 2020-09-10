import React, { useContext, useState, useEffect, useRef } from 'react';
import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Auth from '../modules/auth/Auth';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import moment from 'moment'

import { changePosition, splitJoinAddressOnIsrael, checkDateBlock } from '../fetch_and_utils';



const SBRouteList = (props) => {
    const { admin: isAdmin, selectedSB, meetingsOfSelectedSB } = props
    const [myRoute, setMyRoute] = useState([]);
    const [constB4, setConstB4] = useState([]);
    const [constAfter, setConstAfter] = useState([]);
    const sbctx = useContext(SBContext);
    const { openGenAlert } = useContext(MainContext)

    let userData, totalLength, myMeetings, setMyMeetings, setAssignMeetingInfo, setIsInRoute;
    if (isAdmin) {
        myMeetings = meetingsOfSelectedSB;
    } else if (sbctx) {
        userData = sbctx.userData;
        totalLength = sbctx.totalLength;
        myMeetings = sbctx.myMeetings;
        setMyMeetings = sbctx.setMyMeetings;
        setAssignMeetingInfo = sbctx.setAssignMeetingInfo;
        setIsInRoute = sbctx.setIsInRoute
    }

    const CONST_MEETING = 'CONST_MEETING';
    const container = useRef(null);

    const disableEdit = !isAdmin && checkDateBlock('DATE_TO_BLOCK_BLOWER');
    useEffect(() => {
        //sort all meetings and Separation between const meetings and the route
        if (isAdmin && (!selectedSB || typeof selectedSB !== "object")) return
        const userStartTime = isAdmin ? new Date(selectedSB.volunteering_start_time).getTime() : new Date(userData.startTime).getTime()
        const userEndTime = isAdmin ? (userStartTime + (Number(selectedSB.volunteering_max_time) * 60000)) : (userStartTime + userData.maxRouteDuration);
        const routeStops = [];
        const constStopsB4 = [];
        const constStopsAfter = [];
        let meetingStartTime;

        //fill routeStops, constStopsb4 and constStopsAfter
        for (let i in myMeetings) {
            meetingStartTime = new Date(myMeetings[i].startTime).getTime()
            if (myMeetings[i].constMeeting && (meetingStartTime < userStartTime || meetingStartTime > userEndTime)) {
                // is a meeting set by sb and is not part of blowing route (is before sb said he starts or after his route finishes)
                if (meetingStartTime < userStartTime) {
                    constStopsB4.push(myMeetings[i])
                } else {
                    // console.log('pushing as a AFTER const stop: ', myMeetings[i]);
                    constStopsAfter.push(myMeetings[i])
                }
            }
            else {
                routeStops.push(myMeetings[i])
            }
            if (Number(i) == myMeetings.length - 1) {
                setConstAfter(constStopsAfter);
                setConstB4(constStopsB4);
                setMyRoute(routeStops);
            }
        }
    }, [myMeetings, selectedSB]);

    if (!userData && !isAdmin) return null;



    const textStart = "משך הליכה כולל"
    // const msTT = totalTime
    // const timeUnits = msTT ? "דקות" : ""
    // const tt = msTT ? Math.floor(msTT / 60000) : "---" //in minutes

    let length = !isNaN(Number(totalLength)) ? totalLength : false
    let lengthUnits = `מטרים`
    if (length && length > 1000) {
        lengthUnits = `ק"מ`
        length = totalLength / 1000
    }

    const lengthDotSplit = !length ? "" : JSON.stringify(length).split(".")
    if (Array.isArray(lengthDotSplit) && lengthDotSplit.length > 1) {
        length = `${lengthDotSplit[0]}.${lengthDotSplit[1].substring(0, 2)}`
    }


    // const textValue = `${tt} ${timeUnits} ${length ? `(${length} ${lengthUnits})` : ""}` //goal
    const textValue = ` ${length ? `${length} ${lengthUnits}` : "0 ק\"מ"}`
    // textValue = `35 דקות (3 ק"מ)`//testing   

    const SortableItem = SortableElement(({ value }) =>
        createItemContent(value.value, value.index, value.uniqueKey)
    );

    const SortableList = SortableContainer(({ items }) => {
        return (
            <ul>
                {items.map((value, index) => (
                    <SortableItem key={`item-${index}`} index={index} value={{ value, index, uniqueKey: `${value.meetingId}${value.isPublicMeeting}` }} />
                ))}
            </ul>
        );
    });

    const openOrCloseMeetingInfo = (val) => {
        setIsInRoute(true);
        setAssignMeetingInfo(val);
    }

    const createItemContent = (value, index, uniqueKey) => {
        return (<div key={`sb-route-list-${uniqueKey !== undefined && uniqueKey !== null ? uniqueKey : index}`} className={`meeting-in-route ${(index !== -1) ? 'clickAble' : ''}`} onClick={isAdmin ? undefined : () => index !== -1 && openOrCloseMeetingInfo(value)}>
            <div className="meeting-in-route-img-container" >
                {index !== CONST_MEETING ?
                    <div className="meeting-in-route-img">
                        {index == -1 ? <img src="/icons/white_shofar.svg" /> : Number(index) + 1}
                    </div> : null}
            </div>
            <div className="meeting-in-route-info-container" id={index}>
                <div className="meeting-in-route-info-1">
                    <div className="meeting-in-route-title" >{index == -1 ? "נקודת יציאה" : (value.isPublicMeeting ? "תקיעה ציבורית" : (isAdmin ? value.isolatedName : value.name))}</div>
                    <div className="meeting-in-route-location" >{typeof value.address === "string" ? splitJoinAddressOnIsrael(value.address) : ""}</div>
                    <div className="meeting-in-route-comments" >{value.comments || ""}</div>
                    {isAdmin && value.isPublicMeeting && !isNaN(Number(value.signedCnt)) ? <div className="meeting-in-route-comments" >{`${value.signedCnt} משתתפים`}</div> : null}
                </div>
                <div className="meeting-in-route-info-2">
                    <img src={index == -1 ? "/icons/shofar-blue.svg" : value.isPublicMeeting ? "/icons/group-blue.svg" : "/icons/single-blue.svg"} alt={value.isPublicMeeting ? "תקיעה ציבורית" : "תקיעה פרטית"} />
                    {value.volunteering_start_time || value.startTime ? <div className="meeting-in-route-time">{moment(isAdmin && index == -1 && value.volunteering_start_time ? value.volunteering_start_time : value.startTime).format("HH:mm")}</div> : null}
                </div>
            </div>
            <div className="trash-icon">
                {index !== -1 && props.admin ? <FontAwesomeIcon className="pointer " style={{ fontSize: "1.7vh" }} icon={['fas', 'trash']} color='#156879' onClick={() => { handleTrashClick(index, value) }} /> : null}
            </div>
        </div>)
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        if (oldIndex == newIndex || disableEdit || (!isAdmin && typeof setMyMeetings !== "function") || (isAdmin && typeof props.setMeetingsOfSelectedSB !== "function")) return //no change, dragged and put back in original place, OR is admin
        let newRoute = changePosition(myRoute, oldIndex, newIndex);
        if (isAdmin) {
            props.setMeetingsOfSelectedSB([...constB4, ...newRoute, ...constAfter])
        }
        else {
            //update myRoute and myMeetings according to the reordering
            setMyMeetings([...constB4, ...newRoute, ...constAfter]);
        }
        setMyRoute(newRoute,);
    };

    const handleTrashClick = (index, value) => {
        if (!value || !selectedSB || !selectedSB.id) {
            openGenAlert({ text: 'לא ניתן למחוק כעת, אנא נסה שנית מאוחר יותר ' });
        }
        openGenAlert({ text: `האם את/ה בטוח/ה שברצונך למחוק פגישה זו ממסלול בעל התקוע? ${value && value.signedCount ? `ישנם ${value.signedCount} המחובר/ים לפגישה` : ""}`, isPopup: { okayText: "מחק", cancelText: "בטל, השאר את התקיעה" } },
            async del => {
                if (!del) return;
                let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/deleteMeeting`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify({ meetToDelete: value, blowerId: selectedSB.id })
                });
                if (err || !res) { //open alert of something went wrong
                    openGenAlert({ text: "אירעה שגיאה, אנא נסו שנית מאוחר יותר" })
                }
                if (res) {
                    openGenAlert({ text: "הפגישה הוסרה מהמסלול בהצלחה" })
                    props.setMeetingsOfSelectedSB(myMeetings.filter((meet, i) => {
                        if (i == 0 && myMeetings.length == 1) {
                            window.location.reload()
                        }
                        return (meet.meetingId != value.meetingId || Boolean(meet.isPublicMeeting) !== Boolean(value.isPublicMeeting))
                    }))
                }
            })
    }
    return (
        <div className="sb-route-list" >
            {isAdmin ? null :
                <>
                    <div className="sb-side-list-title" >
                        מפת התקיעות שלי
                    </div>
                    {textValue ? <div className="under-title">
                        {`${textStart}: ${textValue}`}
                    </div> : null}
                    {disableEdit ? <div className="info-msg">יום התקיעה מתקרב והמסלול נעול לשינויים</div> : <div className="info-msg">* ניתן לגרור ולשנות את סדר הפגישות</div>}
                </>}
            <div className="sb-list" id="sb-list" ref={container}>
                {constB4 && Array.isArray(constB4) && constB4.map((item) => createItemContent(item, CONST_MEETING, `${item.meetingId}${item.isPublicMeeting}`))}
                {isAdmin ? createItemContent(selectedSB, -1, -1) :
                    (userData ? createItemContent(userData, -1, -1) : null)}
                {disableEdit ? (myRoute && Array.isArray(myRoute) && myRoute.map((item, index) => createItemContent(item, index, `${item.meetingId}${item.isPublicMeeting}`)))
                    : <SortableList
                        // disabled={isAdmin || disableEdit}
                        helperClass="sort-item-container"
                        distance={1}
                        lockToContainerEdges={true}
                        helperContainer={() => container.current}
                        lockAxis={'y'}
                        items={myRoute}
                        onSortEnd={onSortEnd}
                    />}
                {constAfter && Array.isArray(constAfter) && constAfter.map((item) => createItemContent(item, CONST_MEETING, `${item.meetingId}${item.isPublicMeeting}`))}
            </div>
        </div>
    );
}

export default SBRouteList;