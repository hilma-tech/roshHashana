import React, { useContext, useState } from 'react';
import AdminMap from '../../components/maps/adminMap';
// import Map from '../../components/maps/map';
import TopNavBar from "./TopNavBar"
import './AdminHome.scss'

const AdminHome = (props) => {

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <TopNavBar />
            <AdminMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    )
}
export default AdminHome;