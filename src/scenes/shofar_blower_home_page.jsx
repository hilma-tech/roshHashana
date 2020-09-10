import React, { useEffect, useContext } from 'react';
import { useSocket, useJoinLeave, useOn } from "@hilma/socket.io-react";

import { MainContext } from '../ctx/MainContext';
import { SBContext } from '../ctx/shofar_blower_context';
import Auth from '../modules/auth/Auth';

import ShofarBlowerMap from '../components/maps/shofar_blower_map'

import SBAssignMeeting from '../components/sb_assign_meeting';
import SBNotConfirmed from '../components/sb_not_confirmed';
import SBSideInfo from '../components/sb_side_info';

import './mainPages/MainPage.scss';
import './sb.scss'
import { isBrowser } from 'react-device-detect';

let fetching = false
const SBHomePage = (props) => {

    const { openGenAlert, openGenAlertSync } = useContext(MainContext)
    const {
        userData, setUserData,
        myMeetings, meetingsReqs,
        setMyMeetings, setMeetingsReqs,
        isInRoute, setIsInRoute,
        assignMeetingInfo } = useContext(SBContext)


    const onMobile = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i].some(toMatchItem => navigator.userAgent.match(toMatchItem));

    const socket = useSocket();

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

    useEffect(() => {
        if (userData != null && userData && typeof userData == "object") {
            socket.on(`adminAddMeetingToMyRoute-${userData.username}`, addMeetingToMyRoute)
            if (!userData.confirm) {
                socket.on(`blower_true_confirmQ_${userData.username}`, onConfirmed);
            }
        }
        return () => {
            if (userData) {
                socket.off(`adminAddMeetingToMyRoute-${userData.username}`, addMeetingToMyRoute)
                socket.off(`blower_true_confirmQ_${userData.username}`, onConfirmed);
            }
        };
    }, [userData]);
    const compareIsPublicMeetings = (pm1, pm2) => {
        let pm1bool = (pm1 == 0 || pm1 == false) ? false : (pm1 == 1 || pm1 == true) ? true : null
        let pm2bool = (pm2 == 0 || pm2 == false) ? false : (pm2 == 1 || pm2 == true) ? true : null
        return (pm1bool === null || pm2bool === null) ? false : pm1bool == pm2bool
    }

    useJoinLeave("admin-blower-events", (err) => {
        if (err) console.log("failed to join room");
    });

    useJoinLeave("admin-isolated-events", (err) => {
        if (err) console.log("failed to join room");
    });

    useOn('removeReqFromReqs', (reqToRemoveFromReqs) => {
        setMeetingsReqs(reqs => reqs.filter(req => (!(reqToRemoveFromReqs.meetingId == req.meetingId && compareIsPublicMeetings(reqToRemoveFromReqs.isPublicMeeting, req.isPublicMeeting)))))
    })

    useOn('deleteIsolatedByAdmin', (reqToRemove) => {
        //remove the request if exist in meeting requests
        removeReq(reqToRemove);
        //remove meeting from route if exist
        setMyMeetings(meetings => Array.isArray(meetings) ? meetings.filter(meet => meet.meetingId != reqToRemove.meetingId || meet.isPublicMeeting != reqToRemove.isPublicMeeting) : [])
    });


    useJoinLeave("isolated-events", (err) => {
        if (err) console.log("failed to join room isolated-events");
    });

    useJoinLeave('blower-events', () => (err) => {
        if (err) console.log("failed to join room blower-events");
    });

    useOn('newMeetingAssigned', (req) => {
        setMeetingsReqs((meetingsReqs) => {
            return meetingsReqs.filter((meet) => (meet.isPublicMeeting !== req.isPublicMeeting) || (req.meetingId !== meet.meetingId))
        });
    });

    useOn('removeMeetingFromRoute', (req) => {
        if (req.meetingDeleted) {
            setMeetingsReqs((meetingsReqs) =>
                Array.isArray(meetingsReqs) ?
                    meetingsReqs.filter((meet) =>
                        meet.meetingId !== req.meetingId || meet.isPublicMeeting !== req.isPublicMeeting)

                    : meetingsReqs
            );
        } else
            setMeetingsReqs((meetingsReqs) => [...meetingsReqs, req]);
    });

    useOn("newIsolator", (req) => {
        if (Array.isArray(req.address)) {
            req.address = req.address[0];
        }
        addNewReq(req)
    });;
    useOn('modifyIsolatorInfo', (newReq) => {
        updateReqData(newReq);
    });

    useOn('modifyIsolatorInRoute', (newReq) => {
        updateMyMeet(newReq);
    });

    useOn('removeMeeting', (req) => {
        setMeetingsReqs((meetingsReqs) => {
            return meetingsReqs.filter((meet) => (meet.isPublicMeeting !== req.public_meeting) || (req.meetingId !== meet.meetingId))
        });
    });

    useOn('removeMeetingWithBlower', (req) => {
        setMyMeetings((myMeetings) => {
            return myMeetings.filter((meet) => (meet.isPublicMeeting !== req.public_meeting) || (req.meetingId !== meet.meetingId));
        });
    });

    //SOCKET CALLBACKFS --START ----------------------------------------------------------------------------------------
    const onConfirmed = async (_req) => {
        await openGenAlertSync({ text: "מנהל המערכת אישר אותך!", isPopup: { okayText: "לדף הבית" } })
        setUserData((userData) => ({ ...userData, confirm: 1 }));
        fetchAndSetData(true)
        return;
    }

    const addNewReq = (newReq) => {
        setMeetingsReqs(reqs => Array.isArray(reqs) ? [...reqs, newReq] : [newReq]);
        // no update on genMapData
    }
    const removeReq = (reqToRemove) => {
        setMeetingsReqs(reqs => Array.isArray(reqs) ? reqs.filter(req => req.meetingId != reqToRemove.meetingId || req.isPublicMeeting != reqToRemove.isPublicMeeting) : [])
    }
    const updateReqData = (newReqData) => {
        setMeetingsReqs(reqs => !Array.isArray(reqs) ? [] :
            reqs.map((req) => {
                return (req.meetingId == newReqData.oldMeetingId
                    && req.isPublicMeeting == newReqData.oldIsPublicMeeting) ? { ...req, ...newReqData, meetingId: newReqData.newMeetingId } : req
            })
        );
    }

    const updateMyMeet = (newReqData) => {
        setMyMeetings(reqs => !Array.isArray(reqs) ? [] :
            reqs.map((req) => {
                return (req.meetingId == newReqData.oldMeetingId
                    && req.isPublicMeeting == newReqData.oldIsPublicMeeting) ? { ...req, ...newReqData, meetingId: newReqData.newMeetingId } : req
            })
        );
    }

    const addMeetingToMyRoute = (req) => {
        openGenAlert({ text: "מנהל המערכת שיבץ לך פגישה נוספת! הפגישה נוספה למסלול תקיעות השופר שלך כאן " + (isBrowser ? "מימין" : "למטה"), isPopup: { okayText: "סגור" } })
        setMyMeetings(meetings => Array.isArray(meetings) ? [...meetings, req] : [req]);
    }
    //SOCKET CALLBACKFS --END ----------------------------------------------------------------------------------------

    const fetchAndSetData = async (withoutUserData) => {
        fetching = true
        let [mapContent, err] = await Auth.superAuthFetch(`/api/CustomUsers/mapInfoSB?withoutUserData=${withoutUserData ? true : false}`, null, true);
        if (err || !mapContent) {
            const error = err === "NO_INTERNET" ? "אין חיבור לאינטרנט, לא ניתן לטעון את המידע" : (err.error && err.error.status === "401" ? false : "אירעה שגיאה, נא נסו שנית מאוחר יותר")
            error && openGenAlert({ text: error })
            // console.log("error getting sb map content ", err);
        }
        if (mapContent === "NO_ADDRESS") {
            Auth.logout()
        }
        else if (mapContent && typeof mapContent === "object" && ((!withoutUserData && mapContent.userData && mapContent.userData[0]) || withoutUserData)) {
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