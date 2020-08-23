import React, { useContext, useState } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import './styles/topNavBar.scss'


const TopNavBar = (props) => {

    const { isolatedNum, blowersNum, blowsNum } = useContext(AdminMainContext)
    const [sidebar, setSidebar] = useState (false);

    return <>
        <div className="TopNavBar">
            {/* <div>
                <span onClick = {() => setSidebar(!sidebar)}><MenuIcon className = "hamburger" /></span>
                <img alt="יום תרועה" src = '/images/Group285.svg' />
            </div>
            <div className = "general-numbers">
                <span className = "orange"><span className = "black-font"> {isolatedNum} </span> <div className = "header-detail">מחפשים בעלי תקיעה</div></span>
                <span className = "dark-turq"><span className = "black-font"> {blowersNum} </span> <div className = "header-detail">מתנדבים לתקוע בשופר</div></span>
                <span className = "light-blue"><span className = "black-font"> {blowsNum} </span> <div className = "header-detail">תקיעות שופר ברחבי הארץ</div></span>
            </div> */}
        </div>

        {/* {sidebar && <div className = "admin-sidebar" >
            <img alt = "close sidebar" src = "/icons/close.svg" className = "close-icon"/>
            <table className = "">
                <tr><td><Link to = '/si4583j791WTsa5ga3rwyJERBRfgt54fo3225jfWan32sgba5i'>ראשי</Link></td></tr>
                <tr><td>מחפשים</td></tr>
                <tr><td>בעלי תקיעה</td></tr>
                <tr><td>תקיעות</td></tr>
                <tr><td>הגדרות</td></tr>
                <tr><td>התנתק</td></tr>
            </table>
        </div>} */}
    </>;
}
export default TopNavBar;