import React, { useContext, useEffect, useState } from 'react'
import { AdminMainContext } from './ctx/AdminMainContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdminMap from '../../components/maps/adminMap'

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

            <AdminMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    );
}

export default SingleIsolatorPage;