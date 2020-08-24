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
                <FontAwesomeIcon icon={['fas', 'times']} className="timesPopUp" color='#489FB5' onClick={() => { setOpenParticipantsPopUp(false) }} />
                <div style={{ padding: '0 3vw 2vh', textAlign: "center", fontFamily: "Heebo", width: '55vw', height: "75vh" }}>
                    <DialogContent className="p-0" >
                        <div >
                            <div>
                                <div className="mb-3">רשימת המשתתפים</div>
                                <div className="mb-3">
                                    <Search onSearch={onSearchName} placeholder='חיפוש לפי שם' />
                                </div>
                                {participantsPublicMeeting && <div>סכ"ה {participantsPublicMeeting.length} משתתפים</div>}
                                <ParticipantsTable />
                            </div>
                        </div>
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
}

export default ParticipantsPopUp;