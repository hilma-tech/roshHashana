import React, { useContext, useState, useEffect } from 'react';

import { SBContext } from '../ctx/shofar_blower_context';


const SBRouteInfo = (props) => {
    // const { } = useContext(SBContext)



    return (
        <div className={props.onMobile ? "sb-side-info-mobile-container" : "sb-side-info-container"} >
            <div className="settings clickAble" onClick={() => props.history.push('/settings')} ><img src="/icons/settings.svg" /></div>
        </div>
    );
}

export default SBRouteInfo;