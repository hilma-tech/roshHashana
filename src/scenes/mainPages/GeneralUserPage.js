import React, { useEffect, useState, useContext } from 'react';
import { isBrowser } from "react-device-detect";
import moment from "moment"
import Map from '../../components/maps/map';
import Auth from '../../modules/auth/Auth';
import { MainContext } from '../../ctx/MainContext';
import GeneralAlert from '../../components/modals/general_alert'
import { CONSTS } from '../../consts/const_messages';
import { checkDateBlock } from '../../fetch_and_utils';
import './MainPage.scss';

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
            if (!userInfo) {
                let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getUserInfo`, {
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                }, true);
                if (err || !res) {
                    openGenAlert({ text: err === "NO_INTERNET" ? "אינך מחובר לאינטרנט, לא ניתן להציג את המידע כרגע" : "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
                }
                else {
                    if (res === "NO_MEETING_DELETE_USER") {
                        openGenAlert({ text: "בעל התוקע של פגישה זו מחק את הפגישה, אם ברצונך להשתתף בפגישה נוספת תוכל לעשות זאת במפה הכללית כמשתמש חדש", isPopup: { okayText: "הבנתי, התנתק" } }, () => {
                            Auth.logout()
                        })
                        return;
                    } else {
                        setUserInfo(res)
                        setName(res.name);
                        setShofarBlowerName(res.meetingInfo.blowerName);
                        setAddress(`${res.meetingInfo.address}, ${res.meetingInfo.comments ? res.meetingInfo.comments : ''}`);
                        setTime(`${res.meetingInfo.start_time ? moment(res.meetingInfo.start_time).format("HH:mm") : 'לא נקבעה עדיין שעה'}`);
                    }
                }
            } else {
                setName(userInfo.name);
                if (userInfo.meetingInfo) {
                    setShofarBlowerName(userInfo.meetingInfo.blowerName);
                    setAddress(`${userInfo.meetingInfo.address}, ${userInfo.meetingInfo.comments ? userInfo.meetingInfo.comments : ''}`);
                    setTime(`${userInfo.meetingInfo.start_time ? moment(userInfo.meetingInfo.start_time).format("HH:mm") : 'לא נקבעה עדיין שעה'}`);
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
        props.history.push('/settings', { meetAddress: address });
    }

    //cancel the request and delete the user
    const cancelRequest = async () => {
        if (checkDateBlock('DATE_TO_BLOCK_ISOLATED')) {
            openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר למחוק את המשתמש', block: true });
            return;
        }
        let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            method: "DELETE",
        });
        if (err) console.log("err ",err);
        if (res && res === CONSTS.CURRENTLY_BLOCKED_ERR) {
            openGenAlert({ text: 'מועד התקיעה מתקרב, לא ניתן יותר למחוק את המשתמש' });
        }
        else if (res && res.res === 'SUCCESS') {
            Auth.logout(window.location.href = window.location.origin);
        }
        else openGenAlert({ text: "אירעה שגיאה, נא נסו שנית מאוחר יותר" })
    }

    const disableEdit = checkDateBlock('DATE_TO_BLOCK_ISOLATED');

    return (
        <>
            <div id="isolated-page-container" className={`${openMap ? 'slide-out-top' : 'slide-in-top'}`} style={{ width: isBrowser ? '40%' : '100%' }} >
                <div className="header " style={{ margin: isBrowser ? "0.5rem 0 0 0" : "0.5rem 0 0.5rem 0", width: "100%" }}>
                    <div className="clickAble" onClick={openSettings}>
                        <img alt="settings" src="/icons/settings.svg" /></div>
                </div>
                <div className="content-container containerContent containerGeneralUser" style={{ top: isBrowser ? "0" : "0rem" }}>
                    <img alt="group-orange" className="group-orange" src='/icons/group-orange.svg' />
                    <div className="content"  >{!isBrowser ? `שלום ${name}, \nשמחים שהצטרפת\nלתקיעת שופר בציבור\nאלו הם פרטי מפגש התקיעה: ` : `שלום ${name}, \n הצטרפת לתקיעה ציבורית`}</div>
                    <div className="meetingDetailsContainer" style={{ height: isBrowser ? "12rem" : "fit-content", marginBottom: isBrowser ? "1%" : "20%" }}>
                        {shofarBlowerName && <div className="meetingDetail">
                            <img alt="" className="icon" src="/icons/blueShofar.svg" />
                            <div  >{`בעל תוקע: ${shofarBlowerName}`}</div>
                        </div>}
                        <div className="meetingDetail">
                            <img alt="" className="icon" src="/icons/location.svg" />
                            <div  >{`${address}`}</div>
                        </div>
                        <div className="meetingDetail">
                            <img alt="" className="icon clock" src="/icons/blueClock.svg" />
                            <div>
                                <div  >{`בשעה: ${time}`}</div>
                                <div className="timeNote"> אם יתבצע שינוי בזמן התקיעה נעדכן אותך בהודעה</div>
                            </div>

                        </div>
                        {!disableEdit ? <div id="cancel-request" className="clickAble cancel" onClick={cancelRequest}>בטל השתתפותי בתקיעה זו</div> : null}
                    </div>
                    {!isBrowser && <div id="see-map" className="clickAble" onClick={closeOrOpenMap}>
                        צפייה במפה
                        <img alt="" src='/images/map.svg' />
                    </div>}

                </div>
            </div>
            {(openMap || isBrowser) && <Map closeMap={closeOrOpenMap} meetAddress={address} isolated />}
            {/* {showAlert && showAlert.text ? <GeneralAlert text={showAlert.text} warning={showAlert.warning} block={showAlert.block} isPopup={showAlert.isPopup} noTimeout={showAlert.noTimeout} /> : null} */}

        </>
    );
}

export default GeneralUserPage;