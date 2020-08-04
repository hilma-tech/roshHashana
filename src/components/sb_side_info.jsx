import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import SBRouteList from './sb_route_list';
import SBAllMeetingsList from './sb_all_meetings_list';
import { isBrowser } from 'react-device-detect';

const SBSideInfo = (props) => {
    const [routeDis, setRouteDis] = useState(true)
    const [openRouteList, setOpenRouteList] = useState(false)

    const switchBool = (state) => state(prev => !prev)


    return (
        <div className={`${isBrowser ? "sb-side-list-container" : "sb-side-list-mobile-container"} ${openRouteList ? "open-animation" : "close-animation"}`} id="sb-side-list-container" >
            {!isBrowser ? <div className="blue-line-container" onClick={() => /* the on click could be on click of WHOLE route side list, (when on mobile) */switchBool(setOpenRouteList)}><div className="blue-line" ></div></div> :
                routeDis
                    ?
                    <div id="sb-route-list-top" >
                        <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
                        <div className="list-switch-container clickAble" onClick={() => switchBool(setRouteDis)} >
                            <FontAwesomeIcon icon="list-ul" className="list-switch-icon" />
                            <div className="list-switch-text">הצג מחפשים ברשימה</div>
                        </div>
                    </div>
                    :
                    <div onClick={() => switchBool(setRouteDis)} className="clickAble" id="sb-meetings-list-top" ><img src="/icons/close.svg" /></div>
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