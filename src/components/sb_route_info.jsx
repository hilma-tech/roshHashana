import React, { useContext, useState, useEffect } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';
import { MainContext } from '../ctx/MainContext'

const SBRouteList = (props) => {
    const { myMeetings } = useContext(SBContext)
    const { userInfo } = useContext(MainContext)
    if (!Array.isArray(myMeetings)) myMeetings = [];

    const myRoute = [userInfo, ...myMeetings]

    return (
        <div className={props.onMobile ? "sb-side-info-mobile-container" : "sb-side-info-container"} >
            <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
            <div>{JSON.stringify(myRoute)}</div>
        </div>
    );
}

export default SBRouteList;