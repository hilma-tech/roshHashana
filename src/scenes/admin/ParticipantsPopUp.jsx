import React, { useEffect, useState, useContext } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { AdminMainContext } from './ctx/AdminMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ParticipantsTable from './tables/ParticipantsTable';

const ParticipantsPopUp = (props) => {

    const { isOpenParticipantsPopUp, setOpenParticipantsPopUp } = useContext(AdminMainContext)

    return (
        <div>
            <Dialog open={isOpenParticipantsPopUp} aria-labelledby="reset-modal">
                <FontAwesomeIcon icon={['fas', 'times']} className="timesPopUp" color='#489FB5' onClick={() => { setOpenParticipantsPopUp(false)}} />
                <div>רשימת המשתתפים</div>
                <div style={{ padding: '0 3vw 2vh', textAlign: "center", fontFamily: "Heebo", width: '90vw', height: "100vh" }}>
                    <DialogContent className="p-0" >
                        <div >
                            <div style={{ width: '90vw', height: "100vh" }} >
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