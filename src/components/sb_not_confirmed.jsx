import React, { useState } from 'react';
import { deleteUser } from '../fetch_and_utils';

import { isBrowser } from "react-device-detect";

import Map from './maps/map';
import '../components/maps/map.scss';



const SBNotConfirmed = (props) => {
    const [openMap, setOpenMap] = useState(false);


    const closeOrOpenMap = () => {
        setOpenMap(!openMap);
    }
    const cancelVolunteering = async () => {
        deleteUser((error) => {
            if (error) props.openGenAlert({ text: typeof error === "string" ? error : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
        })
    }





    return (
        <>
            <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} >
                <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
                <div className="content-container">
                    <div id="thank-you-msg">תודה על הרשמתך.</div>
                    <div>בזמן הקרוב נתקשר אליך על מנת לאמת פרטים ולהדריך לגבי הצעדים הבאים.</div>
                    <div>בברכה,<br></br>צוות יום תרועה.</div>
                    <div id="cancel-request" onClick={cancelVolunteering} style={{ marginBottom: isBrowser ? '0%' : '20%' }} className="clickAble">לביטול בקשתך</div>
                    <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                                <img src='/images/map.svg' />
                    </div>
                </div>
            </div>
            {openMap && <Map closeMap={closeOrOpenMap} blower />}{/*general map with no option to assign yourself to the meetings */}
        </>
    );
}

export default SBNotConfirmed;