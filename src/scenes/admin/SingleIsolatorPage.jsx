import React, { useContext, useEffect, useState } from 'react'
import { AdminMainContext } from './ctx/AdminMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SingleIsolatorPage = (props) => {
    const { selectedIsolator, setSelectedIsolator } = useContext(AdminMainContext)

    useEffect(() => {
        if (!selectedIsolator || selectedIsolator === null) {
            props.history.push("/searchings")
            return null
        }
    }, [])

    if (!selectedIsolator || selectedIsolator === null) {
        props.history.push("/searchings")
        return null
    }


    return (
        <div className="single-isolator-page">
            <div id="top" >
                <div id="right-side" >
                    <FontAwesomeIcon id="x-btn" icon={['fas', 'times']} className='pointer' onClick={() => { setSelectedIsolator(null) }} />
                    <div id="title" >{`מחפש - ${selectedIsolator && selectedIsolator.name}, ${selectedIsolator && selectedIsolator.address}`}</div>
                </div>
                <div id="meeting-type" >{`מפגש ${selectedIsolator && selectedIsolator.isPublicMeeting ? "תקיעה ציבורי" : "תקיעה פרטי"}`}</div>
            </div>

        </div>
    );
}

export default SingleIsolatorPage;