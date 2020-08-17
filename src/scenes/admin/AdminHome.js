import React from 'react';
import AdminMap from '../../components/maps/adminMap';
import './AdminHome.scss'
const AdminHome = (props) => {
    console.log("Hey there");
    return <div> 
        <div className = "admin-header">
            <div><img alt = "יום תרועה" src = {'/images/Group285.svg'}/></div>
        <div className = "general-numbers">
            <span className = "orange"><span className = "black-font">312</span> <div className = "header-detail">מחפשים בעלי תקיעה</div></span>
            <span className = "dark-turq"><span className = "black-font">124</span> <div className = "header-detail">מתנדבים לתקוע בשופר</div></span>
            <span className = "light-blue"><span className = "black-font">501</span> <div className = "header-detail">תקיעות שופר ברחבי הארץ</div></span>
        </div>
        </div>
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