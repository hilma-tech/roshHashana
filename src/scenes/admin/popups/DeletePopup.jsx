import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/popup.scss'

const DeletePopup = (props) => {

    const [loading, setLoading] = useState(false)

    return (
        <div>
            <Dialog className='deletePopup' open={true} aria-labelledby="reset-modal" onBackdropClick={() => { if (!loading) props.handleDismiss() }} >
                <div className='tagsPopup' style={{ textAlign: "center" }}>
                    <FontAwesomeIcon
                        icon={['fas', 'times']}
                        className='x pointer'
                        onClick={() => { if (!loading) props.handleDismiss() }}
                    />

                    <DialogContent className="p-0">
                        <div className='textStyle' style={{ margin: '3vh 4vw', fontSize: '2.7vh' }}>
                            האם את/ה בטוח/ה שאת/ה רוצה למחוק את ה{props.name}?
                        </div>
                        <div className="saveBtn pointer" style={{ float: 'left' }} onClick={() => {
                            setLoading(true)
                            props.handleDelete()
                        }}>אישור</div>
                    </DialogContent>
                </div>
            </Dialog>
        </div>
    );
}

export default DeletePopup