import React, { useContext, useState, useEffect, useRef } from 'react';
import moment from 'moment'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { SBContext } from '../ctx/shofar_blower_context';
import { changePosition, splitJoinAddressOnIsrael } from '../fetch_and_utils';


const SBRouteList = (props) => {
    const [myRoute, setMyRoute] = useState([]);
    const [constB4, setConstB4] = useState([]);
    const [constAfter, setConstAfter] = useState([]);
    const { userData, totalTime, totalLength, myMeetings, setMyMeetings, setAssignMeetingInfo, assignMeetingInfo, isInRoute, setIsInRoute } = useContext(SBContext);
    const CONST_MEETING = 'CONST_MEETING';
    const container = useRef(null);

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


    // const textValue = `${tt} ${timeUnits} ${length ? `(${length} ${lengthUnits})` : ""}`
    const textValue = ` ${length ? `${length} ${lengthUnits}` : ""}`
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

    const openOrCloseMeetingInfo = (val) => {
        setIsInRoute(true);
        setAssignMeetingInfo(val);
    }

    const createItemContent = (value, index) => {
        return (<div key={"sb-route-list-" + index} className={`meeting-in-route ${(index !== -1) ? 'clickAble' : ''}`} onClick={() => index !== -1 && openOrCloseMeetingInfo(value)}>
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
        let newRoute = changePosition(myRoute, oldIndex, newIndex);
        //update myRoute and myMeetings according to the reordering
        setMyRoute(newRoute,);
        setMyMeetings([...constB4, ...newRoute, ...constAfter]);
    };

    return (
        <div className="sb-route-list" >
            <div className="sb-side-list-title" >
                מפת התקיעות שלי
            </div>
            {textValue ? <div className="under-title">
                {`${textStart}: ${textValue}`}
            </div> : null}
            <div className="info-msg">* ניתן לגרור ולשנות את סדר הפגישות</div>
            <div className="sb-list" id="sb-list" ref={container}>
                {console.log(document.getElementById('sb-list'))}
                {constB4 && Array.isArray(constB4) && constB4.map((item) => {
                    return createItemContent(item, CONST_MEETING);
                })}
                {userData && createItemContent(userData, -1)}
                {console.log(container, 'container')
                }
                <SortableList
                    helperClass="sort-item-container"
                    distance={1}
                    lockToContainerEdges={true}
                    helperContainer={() => container.current}
                    lockAxis={'y'}
                    items={myRoute}
                    onSortEnd={onSortEnd}
                />
                {constAfter && Array.isArray(constAfter) && constAfter.map((item) => {
                    return createItemContent(item, CONST_MEETING);
                })}
            </div>
        </div>
    );
}

export default SBRouteList;