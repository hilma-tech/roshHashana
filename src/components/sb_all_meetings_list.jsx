import React, { useContext } from 'react'

import { SBContext } from '../ctx/shofar_blower_context'

const SBAllMeetingsList = ({ mobile }) => {

    let { meetingsReqs, setAssignMeetingInfo, userData } = useContext(SBContext)
    const distance = (lat1, lng1, lat2, lng2) => {
        let radlat1 = Math.PI * lat1 / 180;
        let radlat2 = Math.PI * lat2 / 180;
        let theta = lng1 - lng2;
        let radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    };
    let meetingsReqsTemp = meetingsReqs.sort((reqA, reqB) => {
        let origLat = userData.lat,
            origLong = userData.lng;

        return distance(origLat, origLong, reqA.lat, reqA.lng) - distance(origLat, origLong, reqB.lat, reqB.lng);
    })

    const handleAssign = (m) => {
        setAssignMeetingInfo(m)
    }

    return (
        <>
            <div className="sb-side-list-title" >
                מחפשים בסביבתך
            </div>
            {Array.isArray(meetingsReqsTemp) && meetingsReqsTemp.length ? meetingsReqsTemp.map((m, i) => {
                return <div className="open-meeting-in-list" key={"sb-meetings-list-" + i} >
                    <div className="open-meeting-in-list-info">
                        <div className="open-meeting-in-list-title" >{m.isPublicMeeting ? "תקיעה ציבורית" : m.name}</div>
                        <div className="open-meeting-in-list-location" >{m.address || ""}</div>
                        <div className="open-meeting-in-list-comments" >{m.comments || ""}</div>
                    </div>
                    <div className="open-meeting-in-list-button" onClick={() => handleAssign(m)} >
                        שיבוץ
                    </div>
                </div>
            })
                : <div>לא נמצאו בקשות</div>}
        </>
    );
}

export default SBAllMeetingsList;