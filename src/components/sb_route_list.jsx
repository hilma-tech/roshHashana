import React, { useContext, useState, useEffect } from 'react';
import moment from 'moment'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import SBAssignMeeting from './sb_assign_meeting';
import { SBContext } from '../ctx/shofar_blower_context';
import { changePosition, splitJoinAddressOnIsrael } from '../fetch_and_utils';


const SBRouteList = (props) => {
    const [myRoute, setMyRoute] = useState([]);
    const [constB4, setConstB4] = useState([]);
    const [constAfter, setConstAfter] = useState([]);
    const { userData, totalTime, totalLength, myMeetings, setMyMeetings, setAssignMeetingInfo, assignMeetingInfo } = useContext(SBContext);
    const CONST_MEETING = 'CONST_MEETING';

    useEffect(() => {
        //sort all meetings and Separation between const meetings and the route
        const userStartTime = new Date(userData.startTime).getTime()
        const userEndTime = userStartTime + userData.maxRouteDuration;
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
            else routeStops.push(myMeetings[i])
        }
        setConstAfter(constStopsAfter);
        setConstB4(constStopsB4);
        setMyRoute(routeStops);
    }, []);

    if (!userData) return null;


    const textStart = "משך הליכה כולל"
    const msTT = totalTime
    const timeUnits = msTT ? "דקות" : ""
    const tt = msTT ? Math.floor(msTT / 60000) : "---" //in minutes

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


    const textValue = `${tt} ${timeUnits} ${length ? `(${length} ${lengthUnits})` : ""}`
    // textValue = `35 דקות (3 ק"מ)`//testing   

    const SortableItem = SortableElement(({ value }) =>
        createItemContent(value.value, value.index)
    );

    const SortableList = SortableContainer(({ items }) => {
        return (
            <ul>
                {items.map((value, index) => (
                    < SortableItem key={`item-${index}`} index={index} value={{ value: value, index: index }} />
                ))}
            </ul>
        );
    });

    const openMeetingInfo = (meetingInfo) => {
        setAssignMeetingInfo(meetingInfo);
    }

    const createItemContent = (value, index) => {
        return (<div key={"sb-route-list-" + index} className="meeting-in-route clickAble" onClick={() => openMeetingInfo(value)}>
            <div className="meeting-in-route-img-container" >
                <div className="meeting-in-route-img">
                    {index === -1 ?
                        <img src="/icons/white_shofar.svg" />
                        : index === CONST_MEETING ? '' : index + 1}
                </div>
            </div>
            <div className="meeting-in-route-info-container">
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
        console.log('route', changePosition(myRoute, oldIndex, newIndex))
        console.log('meetings', myMeetings)
        let sortedMyMeetings = myMeetings.sort((a, b) => {

        })

        let meetings = [...myMeetings]; //copy my meetings array
        for (i in myMeetings) {

        }
        setMyRoute(
            changePosition(myRoute, oldIndex, newIndex),
        );
    };
    return (
        assignMeetingInfo && typeof assignMeetingInfo === 'object' && Object.keys(assignMeetingInfo).length ?
            <SBAssignMeeting inRoute />
            : <div className="sb-route-list" >
                <div className="sb-side-list-title" >
                    מפת התקיעות שלי
            </div>
                <div className="under-title">
                    {`${textStart}: ${textValue}`}
                </div>
                <div className="sb-list">
                    {constB4 && Array.isArray(constB4) && constB4.map((item) => {
                        return createItemContent(item, CONST_MEETING);
                    })}
                    {userData && createItemContent(userData, -1)}
                    <SortableList distance={1} lockToContainerEdges={true} lockAxis={'y'} items={myRoute} onSortEnd={onSortEnd} />
                    {constAfter && Array.isArray(constAfter) && constAfter.map((item) => {
                        return createItemContent(item, CONST_MEETING);
                    })}
                </div>
            </div>
    );
}

export default SBRouteList;