import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/popup.scss'

const ConfirmShofarBlower = (props) => {

    return (
        <div>
            <Dialog className='confirmShofarBlower' open={true} aria-labelledby="reset-modal">
                <div className='tagsPopup' style={{ textAlign: "center" }}>
                    <FontAwesomeIcon
                        icon={['fas', 'times']}
                        className='x pointer blueText'
                        onClick={() => { props.handleDismiss(null) }}
                    />

                    <DialogContent className="p-0">
                        <div className='textStyle blueText bold' style={{ margin: '3vh 4vw', fontSize: '4vh' }}>
                            {props.num} מתנדבים ממתינים לאישור
                        </div>
                        <div className="saveBtn blueText bold pointer" style={{ margin: '0 auto 2vh', fontSize: '3vh', boxShadow: '#00000029 0 3px 6px' }} onClick={() => {
                            props.handleDismiss(false)
                            props.goTo('/shofar-blowers')
                        }}>אשר מתנדבים</div>
                        <div className="confirm-later-btn blueText pointer" onClick={() => {
                            props.handleDismiss(false)
                        }}>הזכר לי מאוחר יותר</div>
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
}

export default ConfirmShofarBlower