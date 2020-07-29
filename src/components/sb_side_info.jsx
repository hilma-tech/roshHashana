import React, { useContext, useState, useEffect } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext'

import SBRouteList from './sb_route_list';
import SBAllMeetingsList from './sb_all_meetings_list';

const SBSideInfo = (props) => {
    const [routeDis, setRouteDis] = useState(true)
    const switchBool = (state) => state(prev => !prev)


    return (
        <div className={props.onMobile ? "sb-side-list-mobile-container" : "sb-side-list-container"} id="sb-side-list-container" >
            {routeDis
                ?
                <div id="sb-route-list-top" >
                    <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
                    <div className="list-switch-container clickAble" onClick={() => switchBool(setRouteDis)} >
                        <div className="list-switch-icon">icon</div>
                        <div className="list-switch-text">הצג מחפשים ברשימה</div>
                    </div>
                </div>
                :
                <div onClick={() => switchBool(setRouteDis)} className="clickAble" id="sb-meetings-list-top" >x</div>
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