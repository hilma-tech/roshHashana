import React, { useContext, useEffect } from 'react'

import ShofarBlowerMap from '../../components/maps/shofar_blower_map'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminMainContext } from './ctx/AdminMainContext';


const SingleShofarBlowerPage = (props) => {
    const { selectedSB, setSelectedSB } = useContext(AdminMainContext)

    if (!selectedSB || selectedSB === null) {
        props.history.push("/shofar-blowers")
        return null
    }

    let ttlength = "100 מטרים"

    return (
        <div className="single-shofar-blower-page">
            <div id="top" >
                <FontAwesomeIcon id="x-btn" icon={['fas', 'times']} className='pointer' onClick={() => { setSelectedSB(null) }} />
                <div id="title" >{`מפת תקיעות השופר של - ${selectedSB && selectedSB.name}`}</div>
            </div>
            <div id='map-and-info'>
                <div id="info">
                    <div>
                        <FontAwesomeIcon icon="info-circle" />
                        <div>{selectedSB.name}</div>
                        <div>{selectedSB.username}</div>
                    </div>
                    <div>{`משך הליכה כולל: ${ttlength}`}</div>
                </div>
                {!selectedSB || selectedSB === null ? null : <ShofarBlowerMap admin selectedSB={selectedSB} />}
            </div>
        </div>
    );
}

export default SingleShofarBlowerPage;