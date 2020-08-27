import React, { useEffect, useState, useContext } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { AdminMainContext } from './ctx/AdminMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ParticipantsTable from './tables/ParticipantsTable';
import Search from './Search';
import './styles/participantsPopUp.scss'

const ParticipantsPopUp = (props) => {

    const { isOpenParticipantsPopUp, setOpenParticipantsPopUp, participantsPublicMeeting } = useContext(AdminMainContext)

    const onSearchName = (value) => {
        // setFilters(pervFilters => {
        //     if (!pervFilters) pervFilters = {}
        //     pervFilters.name = value
        //     return pervFilters
        // })
        // getIsolateds(filters)
    }

    return (
        <div>
            <Dialog open={isOpenParticipantsPopUp} aria-labelledby="reset-modal">
                <div style={{ display: 'flex' }}>
                    <FontAwesomeIcon icon={['fas', 'times']} className="timesPopUp pointer" color='#489FB5' onClick={() => { setOpenParticipantsPopUp(false) }} />
                    <span className="mb-3 participantList bold">רשימת המשתתפים</span>
                </div>
                <div style={{ padding: '1vh 5vw 2vh 5vw', textAlign: "center", fontFamily: "Heebo", width: '55vw', height: "75vh" }}>
                    <DialogContent className="p-0" >
                        <div >
                                <div className="mb-3">
                                    <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                                </div>
                                {participantsPublicMeeting && <div className="results">סכ"ה {participantsPublicMeeting.length} משתתפים</div>}
                                <ParticipantsTable />
                        </div>
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
}

export default ParticipantsPopUp;