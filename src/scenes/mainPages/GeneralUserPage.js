import React, { useEffect, useState, useContext } from 'react';
import { isBrowser } from "react-device-detect";
import moment from "moment"
import './MainPage.scss';
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import { MainContext } from '../../ctx/MainContext';

const GeneralUserPage = (props) => {
    const { userInfo, setUserInfo } = useContext(MainContext)
    const [openMap, setOpenMap] = useState(false);
    const [name, setName] = useState('');
    const [shofarBlowerName, setShofarBlowerName] = useState('');
    const [adress, setAddress] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        (async () => {
            if (props.location && props.location.state && props.location.state.name && props.location.state.meetingInfo) {
                console.log("from props")
                if (props.location && props.location.state && props.location.state && props.location.state.name) {
                    setName(props.location.state.name);
                }
                if (props.location && props.location.state && props.location.state && props.location.state.meetingInfo) {
                    setShofarBlowerName(props.location.state.meetingInfo.blowerName);
                    setAddress((props.location.state.meetingInfo.city ? `${props.location.state.meetingInfo.city}, ` : ``) + `${props.location.state.meetingInfo.street}, ${props.location.state.meetingInfo.comments}`);
                    setTime(`${moment(props.location.state.meetingInfo.start_time).format("HH:mm")}`);
                }
            } else {
                if (!userInfo) {
                    console.log("from server")
                    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                        headers: { Accept: "application/json", "Content-Type": "application/json" },
                    }, true);
                    if (res) {
                        setUserInfo(res)
                        setName(res.name);
                        setShofarBlowerName(res.meetingInfo.blowerName);
                        setAddress((res.meetingInfo.city ? `${res.meetingInfo.city}, ` : ``) + `${res.meetingInfo.street}, ${res.meetingInfo.comments}`);
                        setTime(`${moment(res.meetingInfo.start_time).format("HH:mm")}`);
                    }
                } else {
                    console.log("from context", userInfo)
                    setName(userInfo.name);
                    if (userInfo.meetingInfo) {
                        setShofarBlowerName(userInfo.meetingInfo.blowerName);
                        setAddress((userInfo.meetingInfo.city ? `${userInfo.meetingInfo.city}, ` : ``) + `${userInfo.meetingInfo.street}, ${userInfo.meetingInfo.comments}`);
                        setTime(`${moment(userInfo.meetingInfo.start_time).format("HH:mm")}`);
                    }
                }
            }

        })()

    }, []);
    //credits:
    // <div>Icons made by <a href="https://www.flaticon.com/authors/vitaly-gorbachev" title="Vitaly Gorbachev">Vitaly Gorbachev</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    // <div>Icons made by <a href="https://www.flaticon.com/authors/those-icons" title="Those Icons">Those Icons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    const closeOrOpenMap = () => {
        setOpenMap(!openMap);
    }

    const openSettings = () => {
        props.history.push('/settings');
    }


    return (
        <>
            <div id="isolated-page-container"  >
                <div className="header">
                    <div ><img alt="backIcon" className="icon" src="/icons/go-back.svg" /></div>
                    <div className="clickAble" onClick={openSettings}><img alt="settings" src="/icons/settings.svg" /></div>
                </div>
                <div className="content-container containerContent">
                    <img alt="group-orange" className="group-orange" src='/icons/group-orange.svg' />
                    <div className="content"  >{`שלום ${name}, \nשמחים שהצטרפת\nלתקיעת שופר בציבור\nאלו הם פרטי מפגש התקיעה:`}</div>
                    <div className="meetingDetailsContainer" style={{ height: isBrowser ? "12rem" : "15rem", marginBottom: isBrowser ? "1%" : "20%" }}>
                        {shofarBlowerName && <div className="meetingDetail">
                            <img className="icon" src="/icons/blueShofar.svg" />
                            <div  >{`בעל תוקע: ${shofarBlowerName}`}</div>
                        </div>}
                        <div className="meetingDetail">
                            <img className="icon" src="/icons/location.svg" />
                            <div  >{`${adress}`}</div>
                        </div>
                        <div className="meetingDetail">
                            <img className="icon clock" src="/icons/blueClock.svg" />
                            <div>
                                <div  >{`בשעה: ${time}`}</div>
                                <div className="timeNote"> אם יתבצע שינוי בזמן התקיעה נעדכן אותך בהודעה</div>
                            </div>

                        </div>
                        <div id="cancel-request" className="clickAble cancel">בטל השתתפותי בתקיעה זו</div>
                    </div>
                    <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                        <img src='/images/map.svg' />
                    </div>

                </div>
            </div>
            {openMap && <Map closeMap={closeOrOpenMap} publicMap />}

        </>
    );
}

export default GeneralUserPage;