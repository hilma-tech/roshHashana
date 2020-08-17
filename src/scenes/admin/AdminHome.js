import React, { useEffect } from 'react';
import AdminMap from '../../components/maps/adminMap';
import { fetchIsolateds } from './fetch_and_utils';

const AdminHome = (props) => {
    // useEffect(() => {
    //     (async () => {
    //         await fetchIsolateds({ start: 0, end: 10 }, null, (err, res) => {
    //             console.log(err, res)
    //         })
    //     })()
    // }, [])

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