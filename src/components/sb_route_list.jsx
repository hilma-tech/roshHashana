import React, { useContext, useState, useEffect } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext'

const SBRouteList = (props) => {
    const { myMeetings, totalTime, totalLength } = useContext(SBContext)
    const { userInfo } = useContext(MainContext)
    if (!Array.isArray(myMeetings)) myMeetings = [];


    const myRoute = [userInfo, ...myMeetings]

    const textStart = "משך הליכה כולל"
    const msTT = totalTime
    const timeUnits = msTT ? "דקות" : ""
    const tt = msTT ? Math.floor(msTT / 60000) : "---" //in minutes

    let length = !isNaN(Number(totalLength)) ? totalLength : false
    let lengthUnits =  `מטרים`
    if(length && length > 1000){
        lengthUnits =  `ק"מ`
        length = totalLength / 1000
    }

    const lengthDotSplit = !length ? "" : JSON.stringify(length).split(".")
    if (Array.isArray(lengthDotSplit) && lengthDotSplit.length > 1) {
        length = `${lengthDotSplit[0]}.${lengthDotSplit[1].substring(0, 2)}`
    }


    const textValue = `${tt} ${timeUnits} ${length ? `(${length} ${lengthUnits})` : ""}`
    // textValue = `35 דקות (3 ק"מ)`

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
                    console.log('m: ', m);
                    return (
                        <div className="meeting-in-route" >
                            <div className="meeting-in-route-img-container" >
                                <div className="meeting-in-route-img">{i}</div>
                                {/* shofar image when i == 0  */}
                            </div>
                            <div className="meeting-in-route-info-container">
                                <div clasName="meeting-in-route-title" >{i == 0 ? "נקודת יציאה" : (m.isPublicMeeting ? "קריאה ציבורית" : m.name)}</div>
                                <div clasName="meeting-in-route-location" >{m.city + " " + m.street}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SBRouteList;