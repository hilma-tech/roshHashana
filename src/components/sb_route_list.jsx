import React, { useContext } from 'react';
import moment from 'moment'

import { SBContext } from '../ctx/shofar_blower_context';

const SBRouteList = (props) => {
    const sbCtxVal = useContext(SBContext)
    const { userData, totalTime, totalLength } = sbCtxVal;
    if (!userData) return null;
    let myMeetings = Array.isArray(sbCtxVal.myMeetings) ? [...sbCtxVal.myMeetings] : [];

    const myRoute = [userData, ...myMeetings]

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

    return (
        <div className="sb-route-list" >
            <div className="sb-side-list-title" >
                מפת התקיעות שלי
            </div>
            <div className="under-title">
                {`${textStart}: ${textValue}`}
            </div>
            <div className="sb-list">
                {myRoute.map((m, i) => {
                    return (
                        <div key={"sb-route-list-" + i} className="meeting-in-route" >
                            <div className="meeting-in-route-img-container" >
                                <div className="meeting-in-route-img">
                                    {i == 0 ?
                                        <img src="/icons/white_shofar.svg" />
                                        : i}
                                </div>
                            </div>
                            <div className="meeting-in-route-info-container">
                                <div className="meeting-in-route-info-1">
                                    <div className="meeting-in-route-title" >{i == 0 ? "נקודת יציאה" : (m.isPublicMeeting ? "קריאה ציבורית" : m.name)}</div>
                                    <div className="meeting-in-route-location" >{typeof m.address === "string" ? m.address.split(", ישראל").join('') : ""}</div>
                                    <div className="meeting-in-route-comments" >{m.comments || ""}</div>
                                </div>
                                <div className="meeting-in-route-info-2">
                                    <img src={m.isPublicMeeting ? "/icons/group-orange.svg" : "/icons/single-blue.svg"} alt={m.isPublicMeeting ? "תקיעה ציבורית" : "תקיעה פרטית"} />
                                    <div className="meeting-in-route-time">{moment(m.startTime).format("HH:mm")}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SBRouteList;