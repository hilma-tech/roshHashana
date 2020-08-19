import React from 'react'

import GeneralPopup from './general_popup';

import './general_alert.scss'


const GeneralAlert = ({ text, warning, block, isPopup, noTimeout = false }) => {
    if (isPopup) return <GeneralPopup text={text} block={block} {...isPopup} />

    return (
        <div id="general-alert-container" className={`${warning ? "warning-color" : "default-color"} ${block ? "block" : ""} ${noTimeout ? "" : "timeout-animation"}`} >
            {text}
        </div>
    );
}

export default GeneralAlert;