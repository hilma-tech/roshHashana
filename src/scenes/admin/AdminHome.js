import React, { useContext, useState } from 'react';
import AdminMap from '../../components/maps/adminMap';
import MenuIcon from '@material-ui/icons/Menu';
import './AdminHome.scss'
import { AdminContext } from '../../ctx/AdminContext';
import { Link } from 'react-router-dom';

const AdminHome = (props) => {

    const { isolatedNum, blowersNum, blowsNum } = useContext(AdminContext)
    const [sidebar, setSidebar] = useState (false);

    return <>
        <div className = "admin-header">
            <div>
                <span onClick = {() => setSidebar(!sidebar)}><MenuIcon className = "hamburger" /></span>
                <img alt="יום תרועה" src = '/images/Group285.svg' />
            </div>
            <div className = "general-numbers">
                <span className = "orange"><span className = "black-font"> {isolatedNum} </span> <div className = "header-detail">מחפשים בעלי תקיעה</div></span>
                <span className = "dark-turq"><span className = "black-font"> {blowersNum} </span> <div className = "header-detail">מתנדבים לתקוע בשופר</div></span>
                <span className = "light-blue"><span className = "black-font"> {blowsNum} </span> <div className = "header-detail">תקיעות שופר ברחבי הארץ</div></span>
            </div>
        </div>

        {sidebar && <div className = "admin-sidebar" >
            <img alt = "close sidebar" src = "/icons/close.svg" className = "close-icon"/>
            <table className = "">
                <tr><td><Link to = '/si4583j791WTsa5ga3rwyJERBRfgt54fo3225jfWan32sgba5i'>ראשי</Link></td></tr>
                <tr><td>מחפשים</td></tr>
                <tr><td>בעלי תקיעה</td></tr>
                <tr><td>תקיעות</td></tr>
                <tr><td>הגדרות</td></tr>
                <tr><td>התנתק</td></tr>
            </table>
        </div>}

        <div className="map-container">
            <AdminMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&language=he&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}`}
                loadingElement={<img alt="נטען..." className="loader" src='/images/loader.svg' />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />} />
        </div>
    </>;
}
export default AdminHome;