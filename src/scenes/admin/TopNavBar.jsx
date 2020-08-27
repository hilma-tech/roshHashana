import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import SideNavBar from './SideNavBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNumVolunteers, getNumberOfIsolatedWithoutMeeting, getNumberOfMeetings } from './fetch_and_utils';
import './styles/topNavBar.scss'


const TopNavBar = (props) => {

    const { isolatedNum, blowersNum, setBlowerNum, blastsNum, setOpenSideBar, setBlastsNum, setIsolatedNum } = useContext(AdminMainContext)

    useEffect(() => {
        (async () => {
            if (!blowersNum || blowersNum === 0) {
                await getNumVolunteers((err, res) => {
                    if (!err) setBlowerNum(res)
                })
            }
            if (!isolatedNum || isolatedNum === 0) {
                await getNumberOfIsolatedWithoutMeeting((err, res) => {
                    if (!err) setIsolatedNum(res)
                })
            }
            if (!blastsNum || blastsNum === 0) {
                await getNumberOfMeetings((err, res) => {
                    if (!err) setBlastsNum(res)
                })
            }

        })()
    }, [])


    return <>
        <SideNavBar />
        <div className="admin-header">
            <div>
                <FontAwesomeIcon icon={['fas', 'bars']} color="#747474" className="menueIcon pointer" onClick={() => { setOpenSideBar(true) }} />
                <img className="iconNav" alt="יום תרועה" src='/images/blueHeader.svg' />
            </div>
            <div className="general-numbers">
                <span className="orange"><span className="black-font"> {isolatedNum} </span> <div className="header-detail">מחפשים בעלי תקיעה</div></span>
                <span className="dark-turq"><span className="black-font"> {blowersNum} </span> <div className="header-detail">מתנדבים לתקוע בשופר</div></span>
                <span className="light-blue"><span className="black-font"> {blastsNum} </span> <div className="header-detail">תקיעות שופר ברחבי הארץ</div></span>
            </div>
        </div>
    </>;
}
export default TopNavBar;