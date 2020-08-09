import React, { useContext, useState, useEffect } from 'react';
import moment from 'moment'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import { SBContext } from '../ctx/shofar_blower_context';
import { changePosition } from '../fetch_and_utils';

const SBRouteList = (props) => {
    const { userData, totalTime, totalLength, myMeetings: myRoute, setMyMeetings: setMyRoute } = useContext(SBContext);
    const [startPoint, setStartPoint] = useState({});
    useEffect(() => {
        if (!userData) return null;
        setStartPoint(userData)

    }, []);

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

    const createItemContent = (value, index) => {
        return (<div key={"sb-route-list-" + index} className="meeting-in-route" >
            <div className="meeting-in-route-img-container" >
                <div className="meeting-in-route-img">
                    {index === -1 ?
                        <img src="/icons/white_shofar.svg" />
                        : index + 1}
                </div>
            </div>
            <div className="meeting-in-route-info-container">
                <div className="meeting-in-route-info-1">
                    <div className="meeting-in-route-title" >{index === -1 ? "נקודת יציאה" : (value.isPublicMeeting ? "קריאה ציבורית" : value.name)}</div>
                    <div className="meeting-in-route-location" >{typeof value.address === "string" ? value.address.split(", ישראל").join('') : ""}</div>
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
        setMyRoute(
            changePosition(myRoute, oldIndex, newIndex),
        );
    };
    return (
        <div className="sb-route-list" >
            <div className="sb-side-list-title" >
                מפת התקיעות שלי
            </div>
            <div className="under-title">
                {`${textStart}: ${textValue}`}
            </div>
            <div className="sb-list">
                {startPoint && createItemContent(startPoint, -1)}
                <SortableList lockToContainerEdges={true} lockAxis={'y'} items={myRoute} onSortEnd={onSortEnd} />
            </div>
        </div>
    );
}

export default SBRouteList;