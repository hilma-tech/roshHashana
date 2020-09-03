import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/popup.scss'

const SuccessPopUp = (props) => {

    return (
        <div>
            <Dialog className='confirmShofarBlower' open={true} aria-labelledby="reset-modal">
                <div className='tagsPopup' style={{ textAlign: "center" }}>
                    <FontAwesomeIcon
                        icon={['fas', 'times']}
                        className='x pointer turquoiseText'
                        onClick={() => { props.handleDismiss() }}
                    />

                    <DialogContent className="p-0">
                        <div className='textStyle turquoiseText bold' style={{ margin: '3vh 4vw', fontSize: '4vh' }}>
                            הפעולה בוצעה בהצלחה
                        </div>
                        <div className="saveBtn turquoiseText bold pointer" style={{ margin: '0 auto 2vh', fontSize: '3vh', boxShadow: '#00000029 0 3px 6px' }} onClick={() => {
                            props.handleApprove()
                        }}>אישור</div>
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
}

export default SuccessPopUp