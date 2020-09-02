import React, { useState, useContext, useEffect } from 'react'

import ShofarBlowerMap from '../../components/maps/shofar_blower_map'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from './ctx/AdminMainContext';
import SBRouteList from '../../components/sb_route_list';
import { adminGetSBRoute } from './fetch_and_utils';


const SingleShofarBlowerPage = (props) => {
    const { selectedSB, setSelectedSB, totalLength } = useContext(AdminMainContext)
    const [meetingsOfSelectedSB, setMeetingsOfSelectedSB] = useState(null)

    useEffect(() => {
        if (!selectedSB || selectedSB === null) {
            props.history.push("/shofar-blowers")
            return null
        }
        fetchAdminSBRoute()
    }, [])

    if (!selectedSB || selectedSB === null) {
        props.history.push("/shofar-blowers")
        return null
    }

    const fetchAdminSBRoute = async () => {
        let [errAdminRoute, resAdminRoute] = await adminGetSBRoute(selectedSB.id)
        if (errAdminRoute || !resAdminRoute) {
            setMeetingsOfSelectedSB(true)
        }
        setMeetingsOfSelectedSB(resAdminRoute)
    }

    // let ttlength = "100 מטרים"
    let ttlength = totalLength || 0 + " מטרים"
    let tooltipText = `עד ${selectedSB.can_blow_x_times == 1 ? "תקיעה אחת" : (selectedSB.can_blow_x_times + " תקיעות בשופר")}\nעד ${selectedSB.volunteering_max_time} דקות הליכה`


    return (
        <div className="single-shofar-blower-page">
            <div id="top" >
                <FontAwesomeIcon id="x-btn" icon={['fas', 'times']} className='pointer' onClick={() => { setSelectedSB(null) }} />
                <div id="title" >{`מפת תקיעות השופר של - ${selectedSB && selectedSB.name}`}</div>
            </div>
            <div id='map-and-info'>
                <div id="side-info-container">
                    <div id="about-sb">
                        <div id="name-and-phone">
                            <div>{selectedSB.name}</div>
                            <div>{selectedSB.username}</div>
                        </div>
                        <div id="more-info-container">
                            <div id='more-info-tooltip'>{tooltipText}</div>
                            <FontAwesomeIcon id="info-icon" className="pointer" icon="info-circle" />
                        </div>
                    </div>
                    <div id="total-length">{`משך הליכה כולל: ${ttlength}`}</div>
                    <SBRouteList admin selectedSB={selectedSB} meetingsOfSelectedSB={meetingsOfSelectedSB} />
                </div>
                {!selectedSB || selectedSB === null ? null : <ShofarBlowerMap admin selectedSB={selectedSB} meetingsOfSelectedSB={meetingsOfSelectedSB} />}
            </div>
        </div>
    );
}

export default SingleShofarBlowerPage;