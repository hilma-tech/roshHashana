import React, { useState, useContext } from 'react'

import { SBContext } from '../ctx/shofar_blower_context'

const SBAllMeetingsList = ({ mobile }) => {

    let { meetingsReqs, setAssignMeetingInfo } = useContext(SBContext)

    const handleAssign = (m) => {
        setAssignMeetingInfo(m)
    }

    return (
        <>
            <div className="sb-side-list-title" >
                מחפשים בסביבתך
            </div>
            {Array.isArray(meetingsReqs) && meetingsReqs.length ? meetingsReqs.map((m, i) => {
                return <div className="open-meeting-in-list" key={"sb-meetings-list-" + i} >
                    <div className="open-meeting-in-list-info">
                        <div className="open-meeting-in-list-title" >{m.isPublicMeeting ? "קריאה ציבורית" : m.name}</div>
                        <div className="open-meeting-in-list-location" >{m.city + " " + m.street + (!m.isPublicMeeting && m.appartment ? (" " + m.appartment) : "")}</div>
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