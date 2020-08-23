import React, { useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import SideNavBar from './SideNavBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles/topNavBar.scss'


const TopNavBar = (props) => {

    const { isolatedNum, blowersNum, blowsNum, setOpenSideBar } = useContext(AdminMainContext)

    return <>
        <SideNavBar history={props.history} />
        <div className="admin-header">
            <div>
                <FontAwesomeIcon icon={['fas', 'bars']} color="#747474" className="menueIcon pointer" onClick={() => { setOpenSideBar(true) }} />
                <img className="iconNav" alt="יום תרועה" src='/images/blueHeader.svg' />
            </div>
            <div className="general-numbers">
                <span className="orange"><span className="black-font"> {isolatedNum} </span> <div className="header-detail">מחפשים בעלי תקיעה</div></span>
                <span className="dark-turq"><span className="black-font"> {blowersNum} </span> <div className="header-detail">מתנדבים לתקוע בשופר</div></span>
                <span className="light-blue"><span className="black-font"> {blowsNum} </span> <div className="header-detail">תקיעות שופר ברחבי הארץ</div></span>
            </div>
        </div>
    </>;
}
export default TopNavBar;