import React, { useEffect, useState, useContext } from 'react';
import { AdminMainContext } from './ctx/AdminMainContext';
import SideNavBar from './SideNavBar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNumVolunteers, getNumberOfIsolatedWithoutMeeting, getNumberOfMeetings } from './fetch_and_utils';
import './styles/topNavBar.scss'


const TopNavBar = (props) => {

    const { isolatedNum, blowersNum, blastsNum, setOpenSideBar,
        setBlowerNum, setIsolatedNum, setBlastsNum, //nums
    } = useContext(AdminMainContext)

    useEffect(() => {
        (async () => {
            //todo make these three remote methods to one (which returns an obj with the 3 nums)
            if (!blowersNum || blowersNum === 0) {
                await getNumVolunteers(true, (err, res) => {
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
                <img onClick={() => { props.history.push("/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/home") }} className="pointer iconNav" alt="יום תרועה" src='/images/blueHeader.svg' />
            </div>
            <div className="general-numbers">
                <span onClick={() => { props.history.push("/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/searchings") }} className="pointer orange"><span className="black-font"> {isolatedNum} </span> <div className="header-detail">מחפשים בעלי תקיעה</div></span>
                <span onClick={() => { props.history.push("/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/shofar-blowers") }} className="pointer dark-turq"><span className="black-font"> {blowersNum} </span> <div className="header-detail">מתנדבים לתקוע בשופר</div></span>
                <span onClick={() => { props.history.push("/skerdsgfkjs9889cdfcis596jtrgd7yfuszygs/meetings") }} className="pointer light-blue"><span className="black-font"> {blastsNum} </span> <div className="header-detail">תקיעות שופר ברחבי הארץ</div></span>
            </div>
        </div>
    </>;
}
export default TopNavBar;