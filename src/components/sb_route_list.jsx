import React, { useContext, useState, useEffect, useRef } from 'react';
import { SBContext } from '../ctx/shofar_blower_context';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import moment from 'moment'

import { changePosition, splitJoinAddressOnIsrael, checkDateBlock } from '../fetch_and_utils';



const SBRouteList = (props) => {
    const { admin: isAdmin, selectedSB, meetingsOfSelectedSB } = props
    const [myRoute, setMyRoute] = useState([]);
    const [constB4, setConstB4] = useState([]);
    const [constAfter, setConstAfter] = useState([]);
    const sbctx = useContext(SBContext);

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
        const userStartTime = isAdmin ? new Date(selectedSB.startTime).getTime() : new Date(userData.startTime).getTime()
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
        }
        setConstAfter(constStopsAfter);
        setConstB4(constStopsB4);
        setMyRoute(routeStops);
    }, [myMeetings]);

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
        return (<div key={`sb-route-list-${uniqueKey !== undefined && uniqueKey !== null ? uniqueKey : index}`} className={`meeting-in-route ${(index !== -1) ? 'clickAble' : ''}`} onClick={() => index !== -1 && openOrCloseMeetingInfo(value)}>
            <div className="meeting-in-route-img-container" >
                {index !== CONST_MEETING ? <div className="meeting-in-route-img">
                    {index === -1 ?
                        <img src="/icons/white_shofar.svg" />
                        : index + 1}
                </div> : null}
            </div>
            <div className="meeting-in-route-info-container" id={index}>
                <div className="meeting-in-route-info-1">
                    <div className="meeting-in-route-title" >{index === -1 ? "נקודת יציאה" : (value.isPublicMeeting ? "קריאה ציבורית" : value.name)}</div>
                    <div className="meeting-in-route-location" >{typeof value.address === "string" ? splitJoinAddressOnIsrael(value.address) : ""}</div>
                    <div className="meeting-in-route-comments" >{value.comments || ""}</div>
                </div>
                <div className="meeting-in-route-info-2">
                    <img src={value.isPublicMeeting ? "/icons/group-orange.svg" : "/icons/single-blue.svg"} alt={value.isPublicMeeting ? "תקיעה ציבורית" : "תקיעה פרטית"} />
                    <div className="meeting-in-route-time">{moment(value.startTime).format("HH:mm")}</div>
                </div>
            </div>
        </div>)
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        if (oldIndex === newIndex || disableEdit || isAdmin || typeof setMyMeetings !== "function") return //no change, dragged and put back in original place, OR is admin
        let newRoute = changePosition(myRoute, oldIndex, newIndex);
        //update myRoute and myMeetings according to the reordering
        setMyRoute(newRoute,);
        setMyMeetings([...constB4, ...newRoute, ...constAfter]);
    };

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
                        disabled={isAdmin || disableEdit}
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