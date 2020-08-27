require('dotenv').config()

const { sendMsg } = require('../server/sendSms/SendSms');
const useQuery = require('./query_excecute');
const query = `
SELECT * FROM
    (
    SELECT false isPublicMeeting, false constMeeting, isolated.blowerMeetingId AS "blowerId", blower.name AS blowerName, blower.username AS "blowerPhone", CustomUser.address AS "meetingAddress", CustomUser.comments AS "addressComments", 
    IF(isolated.public_phone = 1, CustomUser.username, NULL) isolatedPhone, meeting_time AS "meetingStartTime"
    FROM isolated 
    JOIN CustomUser ON userIsolatedId = CustomUser.id 
    LEFT JOIN CustomUser blower ON isolated.blowerMeetingId = blower.id 
    WHERE public_meeting = 0 
    AND blowerMeetingId IS NOT NULL
    UNION
    SELECT true isPublicMeeting, shofar_blower_pub.constMeeting, shofar_blower_pub.blowerId AS "blowerId", blower.name AS blowerName, blower.username AS "blowerPhone", shofar_blower_pub.address AS "meetingAddress", shofar_blower_pub.comments AS "addressComments", NULL isolatedPhone, start_time AS "meetingStartTime"
    FROM isolated 
    JOIN shofar_blower_pub on isolated.blowerMeetingId =  shofar_blower_pub.id
    LEFT JOIN CustomUser blower ON isolated.blowerMeetingId = blower.id 
    WHERE public_meeting = 1 AND shofar_blower_pub.blowerId IS NOT NULL AND shofar_blower_pub.constMeeting = 0
    UNION 
    SELECT true isPublicMeeting, shofar_blower_pub.constMeeting, shofar_blower_pub.blowerId AS "blowerId", blower.name AS blowerName, blower.username AS "blowerPhone", shofar_blower_pub.address AS "meetingAddress", shofar_blower_pub.comments AS "addressComments", NULL isolatedPhone, start_time AS "meetingStartTime"
    FROM shofar_blower_pub
    LEFT JOIN CustomUser blower ON blower.id = shofar_blower_pub.blowerId
    WHERE blowerId IS NOT NULL AND constMeeting = 1
    ) a
    ORDER BY blowerId, meetingStartTime
`;

let msg = "";
useQuery(query, (err, data, _fields) => {
    if (err) throw err;
    console.log('data: ', data);
    for (let meeting of data) {
        msg = `שלום ${meeting.blowerName || ""}, המסלול שלך מוכן ומחכה לך באתר שלנו ${process.env.REACT_APP_DOMAIN}/?p=t שם תוכל/י לצפות בו ולהדפיסו. בברכה, מיזם "יום תרועה"`;
        console.log('msg: ', msg);
        // sendMsg(blower.phoneNumber, msg)
    }
});