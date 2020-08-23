import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from './ctx/AdminMainContext';
import { deletePublicMeeting } from './fetch_and_utils';
import './styles/BlastInfo.scss'
import ParticipantsPopUp from "./ParticipantsPopUp"
import { getTime} from './fetch_and_utils';


const BlastInfo = (props) => {

    const { blastInfo, isOpenParticipantsPopUp, setOpenParticipantsPopUp } = useContext(AdminMainContext)

    const handleTrashClick = (id) => {
        (async () => {
            await deletePublicMeeting(id, (err, res) => {
                console.log(err, res)
            })
        })()
    }

    const handleParticipantsClick = () => {
        setOpenParticipantsPopUp(true)
    }

    return (
        <div className="BlastInfo">

            <div className="flexContainer leftdives">
                <div className="bold fonttkia">תקיעה {blastInfo.type}</div>
                <div>10 משתתפים</div>
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
                        <div className="bottomToList pointer" onClick={() => { handleParticipantsClick() }}>רשימת המשתתפים</div>
                    </div>
                </div>}
                <div className="flexRow delete pointer" onClick={() => { handleTrashClick(blastInfo.id) }}>
                    <div className="width25" style={{ fontSize: "1.7vh" }}>
                        <FontAwesomeIcon icon={['fas', 'trash']} color='#156879' />
                    </div>
                    <div className="width75">
                        <div className="info">מחק מפגש תקיעה בשופר</div>
                    </div>
                </div>
            </div>
            <ParticipantsPopUp />

        </div >
    );
}
export default BlastInfo;