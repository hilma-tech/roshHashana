import React, { useEffect, useState, useContext } from 'react';
import { isBrowser } from "react-device-detect";
import moment from "moment"
import './MainPage.scss';
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import { MainContext } from '../../ctx/MainContext';
import GeneralAlert from '../../components/modals/general_alert'
const GeneralUserPage = (props) => {
    const { userInfo, setUserInfo, showAlert, openGenAlert } = useContext(MainContext)
    const [openMap, setOpenMap] = useState(false);
    const [name, setName] = useState('');
    const [shofarBlowerName, setShofarBlowerName] = useState('');
    const [address, setAddress] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        (async () => {
            if (props.location && props.location.state && props.location.state.cantSignUpAgain && !sessionStorage.getItem("dontShowPopup")) {
                openGenAlert({ text: "כבר נרשמת לתקיעה ציבורית, אינך יכול להירשם לתקיעה נוספת", isPopup: { okayText: "סגור" } })
                sessionStorage.setItem("dontShowPopup", true)
            }
            if (props.location && props.location.state && props.location.state.name && props.location.state.meetingInfo) {
                console.log("from props")
                if (props.location.state.name) {
                    setName(props.location.state.name);
                }
                if (props.location.state.meetingInfo) {
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
    useEffect(() => {
        return () => {
            // Anything in here is fired on component unmount.
            sessionStorage.removeItem("dontShowPopup")
        }
    }, [])


    //credits:
    // <div>Icons made by <a href="https://www.flaticon.com/authors/vitaly-gorbachev" title="Vitaly Gorbachev">Vitaly Gorbachev</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    // <div>Icons made by <a href="https://www.flaticon.com/authors/those-icons" title="Those Icons">Those Icons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    const closeOrOpenMap = () => {
        setOpenMap(!openMap);
    }

    const openSettings = () => {
        props.history.push('/settings');
    }

    //cancel the request and delete the user
    const cancelRequest = async () => {
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "DELETE",
        });
        if (res && res.res === 'SUCCESS') {
            Auth.logout(window.location.href = window.location.origin);
        }
        // else  TODO: לשים הודעה שזה נכשל
    }

    return (
        <>
            <div id="isolated-page-container"  >
                <div className="header " style={{ margin: isBrowser ? "0.5rem 0 0 0" : "0.5rem 0 0.5rem 0" }}>
                    <div ><img alt="backIcon" onClick={() => { props.history.goBack() }} className="icon" src="/icons/go-back.svg" /></div>
                    <div className="clickAble" onClick={openSettings}><img alt="settings" src="/icons/settings.svg" /></div>
                </div>
                <div className="content-container containerContent" style={{ top: isBrowser ? "3.5rem" : "4rem" }}>
                    <img alt="group-orange" className="group-orange" src='/icons/group-orange.svg' />
                    <div className="content"  >{`שלום ${name}, \nשמחים שהצטרפת\nלתקיעת שופר בציבור\nאלו הם פרטי מפגש התקיעה:`}</div>
                    <div className="meetingDetailsContainer" style={{ height: isBrowser ? "12rem" : "15rem", marginBottom: isBrowser ? "1%" : "20%" }}>
                        {shofarBlowerName && <div className="meetingDetail">
                            <img className="icon" src="/icons/blueShofar.svg" />
                            <div  >{`בעל תוקע: ${shofarBlowerName}`}</div>
                        </div>}
                        <div className="meetingDetail">
                            <img className="icon" src="/icons/location.svg" />
                            <div  >{`${address}`}</div>
                        </div>
                        <div className="meetingDetail">
                            <img className="icon clock" src="/icons/blueClock.svg" />
                            <div>
                                <div  >{`בשעה: ${time}`}</div>
                                <div className="timeNote"> אם יתבצע שינוי בזמן התקיעה נעדכן אותך בהודעה</div>
                            </div>

                        </div>
                        <div id="cancel-request" className="clickAble cancel" onClick={cancelRequest}>בטל השתתפותי בתקיעה זו</div>
                    </div>
                    <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                        <img src='/images/map.svg' />
                    </div>

                </div>
            </div>
            {openMap && <Map closeMap={closeOrOpenMap} meetAddress={address} isolated />}
            {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null}

        </>
    );
}

export default GeneralUserPage;