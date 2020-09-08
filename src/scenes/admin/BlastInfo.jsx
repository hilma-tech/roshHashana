import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from './ctx/AdminMainContext';
import ParticipantsPopup from "./popups/ParticipantsPopup"
import { getTime, getParticipantsMeeting, deletePublicMeeting, deleteConectionToMeeting } from './fetch_and_utils';
import './styles/blastInfo.scss'


const BlastInfo = (props) => {

    const { blastInfo, setOpenParticipantsPopUp, setParticipantsPublicMeeting } = useContext(AdminMainContext)

    // const handleTrashClick = (id) => {
    //     (async () => {
    //         // await deletePublicMeeting(id, (err, res) => {
    //         //     console.log(err, res)
    //         // })
    //         await deleteConectionToMeeting(id, (err, res) => {
    //             console.log(err, res)
    //         })
    //     })()
    // }

    const handleParticipantsClick = (id, startRow = 0, filter = {}) => {
        (async () => {
            setOpenParticipantsPopUp(true)
            await getParticipantsMeeting(id, startRow, filter, (err, res) => {
                if (res) {
                    setParticipantsPublicMeeting(res)
                }
            })
        })()

    }

    return (
        <div className="BlastInfo">

            <div className="flexContainer leftdives">
                <div className="bold fonttkia">תקיעה {blastInfo.type}</div>
                {blastInfo.type === "ציבורית" && <div>{blastInfo.participantsNum} משתתפים</div>}
            </div>

            <div className="flexContainer infoBox">
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" src="/icons/blueShofar.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">{blastInfo.blowerName}</div>
                        <div className="info">{blastInfo.phone}</div>
                    </div>
                </div>
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" style={{ width: "2vh" }} src="/icons/blueClock.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">{getTime(blastInfo.start_time)}</div>
                    </div>
                </div>
                {blastInfo.type !== "ציבורית" && < div className="flexRow">
                    <div className="width25">
                        <img className="icon" src="/icons/peopleBlue.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">מוטי לוי</div>
                        <div className="info">052-4773888</div>
                    </div>
                </div>}
                <div className="flexRow">
                    <div className="width25">
                        <img className="icon" style={{ width: "2.4vh" }} src="/icons/location.svg" />
                    </div>
                    <div className="width75">
                        <div className="info">{blastInfo.address}</div>
                        <div className="info">{blastInfo.comments}</div>
                    </div>
                </div>
                {blastInfo.type === "ציבורית" && <div className="flexRow">
                    <div className="width25">
                    </div>
                    <div className="width75" >
                        <div className="bottomToList pointer" onClick={() => { handleParticipantsClick(blastInfo.id) }}>רשימת המשתתפים</div>
                    </div>
                </div>}
                {blastInfo.type !== "ציבורית" && <div className="flexRow delete pointer deleteMeeting" onClick={() => { props.handleTrashClick(blastInfo.id, blastInfo.index) }}>
                    <div className="width25" style={{ fontSize: "1.7vh" }}>
                        <FontAwesomeIcon icon={['fas', 'trash']} />
                    </div>
                    <div className="width75">
                        <div className="info">מחק מפגש תקיעה בשופר</div>
                    </div>
                </div>}
            </div>
            <ParticipantsPopup />

        </div>
    );
}
export default BlastInfo;