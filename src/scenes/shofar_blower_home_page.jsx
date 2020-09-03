import React, { useEffect, useContext } from 'react';
import { useSocket, useJoinLeave, useOn } from "@hilma/socket.io-react";

import { MainContext } from '../ctx/MainContext';
import { SBContext } from '../ctx/shofar_blower_context';
import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import GeneralAlert from '../components/modals/general_alert'
import SBAssignMeeting from '../components/sb_assign_meeting';
import SBNotConfirmed from '../components/sb_not_confirmed';
import SBSideInfo from '../components/sb_side_info';

import { isBrowser } from 'react-device-detect';

import './mainPages/MainPage.scss';
import './sb.scss'

let fetching = false
const SBHomePage = (props) => {

    const { showAlert, openGenAlert } = useContext(MainContext)
    const {
        userData, setUserData,
        myMeetings, meetingsReqs,
        setMyMeetings, setMeetingsReqs,
        isInRoute, setIsInRoute,
        assignMeetingInfo } = useContext(SBContext)
    // const socket = useSocket();


    const onMobile = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i].some(toMatchItem => navigator.userAgent.match(toMatchItem));

    useJoinLeave("admin-blower-events", (err) => {
        if (err) console.log("failed to join room");
    })

    const socket = useSocket();

    useEffect(() => {
        if (userData != null) {
            socket.on(`blower_true_confirmQ_${userData.username}`, fn);

            return () => {
                socket.off(`blower_true_confirmQ_${userData.username}`, fn);
            };
        }
    }, [userData]);

    const fn = (req) => {
        setUserData((userData) => ({ ...userData, confirm: 1 }))
        return
       
    }


    useJoinLeave("isolated-events", (err) => {
        if (err) console.log("failed to join room isolated-events");
    })

    useJoinLeave('blower-events', () => (err) => {
        if (err) console.log("failed to join room blower-events");
    })

    useOn('newMeetingAssined', (req) => {
        setMeetingsReqs((meetingsReqs) => {
            return meetingsReqs.filter((meet) => (meet.isPublicMeeting !== req.isPublicMeeting) || (req.meetingId !== meet.meetingId))
        })
    });

    useOn('removeMeetingFromRoute', (req) => {
        setMeetingsReqs((meetingsReqs) => [...meetingsReqs, req])
    });

    useOn("newIsolator", (req) => {
        addNewReq(req)
    });
    useOn('modifyIsolatorInfo', (newReq) => {
        updateReqData(newReq)
    })

    useEffect(() => {
        (async () => {
            if (!fetching && (
                !meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length) ||
                !myMeetings || (Array.isArray(myMeetings) && !myMeetings.length) ||
                !userData || (Array.isArray(userData) && !userData.length))
            ) {
                fetchAndSetData()
            }
        })();
    }, []);

    const addNewReq = (newReq) => {
        setMeetingsReqs(reqs => Array.isArray(reqs) ? [...reqs, newReq] : [newReq])
        // no update on genMapData
    }
    const removeReq = (reqToRemove) => {
        setMeetingsReqs(reqs => Array.isArray(reqs) ? reqs.filter(req => req.meetingId != reqToRemove.meetingId && req.isPublicMeeting != reqToRemove.isPublicMeeting) : [])
    }
    const updateReqData = (newReqData) => {
        setMeetingsReqs(reqs => !Array.isArray(reqs) ? [] :
            reqs.map((req) => {
                if (newReqData.oldMeetingId !== null && newReqData.oldIsPublicMeeting !== null && newReqData.oldMeetingId !== undefined && newReqData.oldIsPublicMeeting !== undefined) {
                    return (req.meetingId == newReqData.oldMeetingId
                        && req.isPublicMeeting == newReqData.oldIsPublicMeeting) ? newReqData : req
                }
                else if (newReqData.oldMeetingId !== null && newReqData.oldMeetingId !== undefined) {
                    return (req.meetingId == newReqData.oldMeetingId
                        && req.isPublicMeeting == newReqData.isPublicMeeting) ? newReqData : req
                }
                else if (newReqData.oldIsPublicMeeting !== null && newReqData.oldIsPublicMeeting !== undefined) {
                    return (req.meetingId == newReqData.meetingId
                        && req.isPublicMeeting == newReqData.oldIsPublicMeeting) ? newReqData : req
                }
                else {
                    return (req.meetingId == newReqData.meetingId && req.isPublicMeeting == newReqData.isPublicMeeting) ? newReqData : req
                }

            })
        )
    }

    const fetchAndSetData = async () => {
        fetching = true
        let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/mapInfoSB`, null, true);
        if (err || !mapContent) {
            const error = err === "NO_INTERNET" ? "אין חיבור לאינטרנט, לא ניתן לטעון את המידע" : (err.error && err.error.status === "401" ? false : "אירעה שגיאה, נא נסו שנית מאוחר יותר")
            error && openGenAlert({ text: error })
            // console.log("error getting sb map content ", err);
        }
        if (mapContent === "NO_ADDRESS") {
            Auth.logout()
        }
        else if (mapContent && typeof mapContent === "object" && mapContent.userData && mapContent.userData[0]) {
            if (!meetingsReqs || (Array.isArray(meetingsReqs) && !meetingsReqs.length)) setMeetingsReqs(mapContent.openReqs)
            //sort my routes by startTime, where closest (lowest) is first
            if (!myMeetings || (Array.isArray(myMeetings) && !myMeetings.length)) setMyMeetings(Array.isArray(mapContent.myRoute) ? mapContent.myRoute.sort((a, b) => (new Date(a.startTime) > new Date(b.startTime) ? 1 : new Date(a.startTime) < new Date(b.startTime) ? -1 : 0)) : null)
            if (!userData || (Array.isArray(userData) && !userData.length)) setUserData(mapContent.userData[0])

            //if got .length == limit, call again -- and on SET need to check if already have some data and then add and not set
        }
        fetching = false
    }



    return (
        <div className="sb-homepage-container">
            {
                !userData && !meetingsReqs && !myMeetings ? <img alt="נטען..." className="loader" src='/images/loader.svg' /> : ((userData && typeof userData === "object" && userData.confirm == 1) ?
                    <>

                        {/* ALL THINGS FOR MAP PAGE */}
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? <SBAssignMeeting inRoute={isInRoute} /> : null}
                        {assignMeetingInfo && typeof assignMeetingInfo === "object" ? null : <SBSideInfo onMobile={onMobile} history={props.history} />}

                        {assignMeetingInfo && typeof assignMeetingInfo === "object" && onMobile ? null : <ShofarBlowerMap location={props.location} history={props.history} />}
                    </>
                    :
                    /* USER IS NOT CONFIRMED */
                    <SBNotConfirmed history={props.history} onMobile={onMobile} openGenAlert={openGenAlert} />
                )
            }
        </div>
    );
}

export default SBHomePage;