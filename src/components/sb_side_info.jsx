import React, { useState, useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { checkDateBlock } from '../fetch_and_utils';
import SBRouteList from './sb_route_list';
import SBAllMeetingsList from './sb_all_meetings_list';
import { isBrowser } from 'react-device-detect';
import { Swipeable } from 'react-swipeable'
import { SBContext } from '../ctx/shofar_blower_context';

const SBSideInfo = (props) => {
    const [routeDis, setRouteDis] = useState(true);
    const [openRouteList, setOpenRouteList] = useState(null);
    const { isPrint, setIsPrint } = useContext(SBContext);

    const switchBool = (state) => state(prev => !prev)

    const disableEdit = checkDateBlock('DATE_TO_BLOCK_BLOWER');

    return (
        <div className={`${isBrowser ? "sb-side-list-container" : "sb-side-list-mobile-container"} ${openRouteList === null ? "" : (openRouteList ? "open-animation" : "close-animation")} ${isPrint ? 'print-style' : ''}`} id="sb-side-list-container" >
            {!isBrowser ?
                <Swipeable onSwiping={(e) => {
                    if (e.dir === 'Up') {
                        setOpenRouteList(true)
                    }
                    if (e.dir === 'Down') {
                        setOpenRouteList(false)
                    }
                }} >
                    <div className="blue-line-container" onClick={() => /* the on click could be on click of WHOLE route side list, (when on mobile) */switchBool(setOpenRouteList)}>
                        <div className="blue-line" ></div>
                    </div>
                </Swipeable> :
                routeDis
                    ?
                    <div id="sb-route-list-top" >
                        <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img alt="" src=" /icons/settings.svg" /></div>
                        {!disableEdit ? <div className="list-switch-container clickAble" onClick={() => switchBool(setRouteDis)} >
                            <FontAwesomeIcon icon="list-ul" className="list-switch-icon" />
                            <div className="list-switch-text">הצג מחפשים ברשימה</div>
                        </div> : null}
                    </div>
                    :
                    <div onClick={() => switchBool(setRouteDis)} className="clickAble" id="sb-meetings-list-top" ><img alt="" src=" /icons/close.svg" /></div>
            }
            <div className="sb-side-list-content">
                {
                    routeDis ?
                        <SBRouteList />
                        :
                        <SBAllMeetingsList />
                }
            </div>
        </div >
    );
}

export default SBSideInfo;