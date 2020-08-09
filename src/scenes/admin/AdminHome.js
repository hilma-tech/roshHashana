import React from 'react';
import AdminMap from '../../components/maps/adminMap';

const AdminHome = (props) => {
    console.log("Hey there");
    return <div> welcome admin!!!
        <div className="map-container">
            <AdminMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />} />
        </div>
    </div >;
}
export default AdminHome;