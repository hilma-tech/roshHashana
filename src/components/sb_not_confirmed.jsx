import React, { useState } from 'react';
import loadable from '@loadable/component';

import { deleteUser, checkDateBlock } from '../fetch_and_utils';

import { isBrowser } from "react-device-detect";

import '../components/maps/map.scss';
import { useContext } from 'react';
import { MainContext } from '../ctx/MainContext';

const Map = loadable(() => import('./maps/map'));


const SBNotConfirmed = (props) => {
    const { openGenAlert } = useContext(MainContext)
    const [openMap, setOpenMap] = useState(false);


    const closeOrOpenMap = () => {
        setOpenMap(!openMap);
    }
    const cancelVolunteering = () => {
        openGenAlert({ text: "האם את/ה בטוח/ה שברצונך לבטל את הבקשה?", isPopup: { okayText: "כן", cancelText: "לא" } }, (continuE) => {
            if (!continuE) return;
            deleteUser((error) => {
                if (error) props.openGenAlert({ text: typeof error === "string" ? error : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
            }, 'DATE_TO_BLOCK_BLOWER')
        })

    }

    const disableEdit = checkDateBlock('DATE_TO_BLOCK_BLOWER');

    return (
        <>
            <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} style={{ width: isBrowser ? '40%' : '100%' }} >
                <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img alt="" src="/icons/settings.svg" /></div>
                <div className="content-container">
                    <div id="thank-you-msg">תודה על הרשמתך.</div>
                    <div>בזמן הקרוב נתקשר אליך על מנת לאמת פרטים ולהדריך לגבי הצעדים הבאים.</div>
                    <div>בברכה,<br></br>צוות יום תרועה.</div>
                    {!disableEdit ? <div id="cancel-request" onClick={cancelVolunteering} style={{ marginBottom: isBrowser ? '0%' : '20%', marginTop: isBrowser ? '10%' : '5%' }} className="clickAble">לביטול הרשמתך</div> : null}
                    {!isBrowser && <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                                <img alt="" src='/images/map.svg' />
                    </div>}
                </div>
            </div>
            {(openMap || isBrowser) && <Map closeMap={closeOrOpenMap} blower />}{/*general map with no option to assign yourself to the meetings */}
        </>
    );
}

export default SBNotConfirmed;