const { sendMsg } = require('../server/sendSms/SendSms');
const useQuery = require('./query_excecute');
// all meetings, ordered by blower id and by time
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
    JOIN shofar_blower_pub on isolated.blowerMeetingId = shofar_blower_pub.id
        LEFT JOIN CustomUser blower ON shofar_blower_pub.blowerId = blower.id 
    WHERE public_meeting = 1 
        AND shofar_blower_pub.blowerId IS NOT NULL 
        AND shofar_blower_pub.constMeeting = 0
    
    UNION 
    
    SELECT true isPublicMeeting, shofar_blower_pub.constMeeting, shofar_blower_pub.blowerId AS "blowerId", blower.name AS blowerName, blower.username AS "blowerPhone", shofar_blower_pub.address AS "meetingAddress", shofar_blower_pub.comments AS "addressComments", NULL isolatedPhone, start_time AS "meetingStartTime"
    FROM shofar_blower_pub
        LEFT JOIN CustomUser blower ON blower.id = shofar_blower_pub.blowerId
    WHERE blowerId IS NOT NULL AND constMeeting = 1
    ) a
    ORDER BY blowerId, meetingStartTime
`;

let smsMsgsArr = []
let meetingsMsg = "";
let secondMsg = `ניתן לצפות במסלול המלא ולהדפיס אותו באתר שלנו https://shofar2all.com/?p=t \nבברכה, מיזם "יום תרועה".`;
let meetingStartTime;
let meetingDate; //temp, to get hours and minutes for meetingStartTime
useQuery(query, (err, meetings, _fields) => {
    if (err) throw err;
    console.log('meetings: ', meetings);
    for (let i = 0; i < meetings.length; i++) {
        meetingDate = new Date(meetings[i].meetingStartTime);
        meetingStartTime = String(meetingDate.getHours()).padStart(2, 0) + ":" + String(meetingDate.getMinutes()).padStart(2, 0);
        if (typeof meetings[i].meetingAddress === "string" && meetingStartTime && meetings[i].isPublicMeeting !== null && meetings[i].isPublicMeeting !== undefined)
            meetingsMsg += `\n\n${meetingStartTime} - ${meetings[i].isPublicMeeting ? "תקיעה ציבורית" : "תקיעה פרטית"}, ב${meetings[i].meetingAddress.split(", ישראל").join("")}`

        if (!meetings[Number(i) + 1] || !meetings[Number(i) + 1].blowerId || meetings[Number(i) + 1].blowerId != meetings[i].blowerId) {
            //in curr blower but next one is a new blower
            smsMsgsArr.push([meetings[i].blowerPhone, `שלום ${meetings[i].blowerName || ""}, תודה על הנכונות שלך לעזור!\n מסלול תקיעות השופר שלך ביום השני של ראש השנה (ב' בתשרי) הוא:` + meetingsMsg + "\n\n" + secondMsg])
            meetingsMsg = ``
        }
    }
    let cnt = 0
    let msg;
    for (let i = 0; i < smsMsgsArr.length; i++) {
        msg = smsMsgsArr[i]
        console.log('sendMsg to: ', msg[1]);
        sendMsg(msg[0], msg[1])
        cnt++
        if (smsMsgsArr.length - 1 == i) //in last place 
            console.log("script is done, send msg to", cnt, ' shofar blowers')
    }
});
