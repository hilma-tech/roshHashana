const q = `SELECT
true AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber" , shofar_blower_pub.address AS "meetingAddress", CustomUser.comments AS "addressComments", shofar_blower_pub.start_time AS "meetingStartTime", blowerUser.name AS "blowerName"
FROM isolated
LEFT JOIN shofar_blower_pub ON isolated.blowerMeetingId=shofar_blower_pub.id
LEFT JOIN CustomUser ON isolated.userIsolatedId= CustomUser.id
LEFT JOIN CustomUser blowerUser ON blowerUser.id= shofar_blower_pub.blowerId
LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
WHERE isolated.public_meeting=1
UNION SELECT
false AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber", CustomUser.address AS "meetingAddress",CustomUser.comments AS "addressComments", isolated.meeting_time AS "meetingStartTime" ,blowerUser.name AS "blowerName"
FROM isolated
LEFT JOIN CustomUser ON CustomUser.id= isolated.userIsolatedId
LEFT JOIN CustomUser blowerUser ON blowerUser.id=blowerMeetingId
LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
WHERE isolated.public_meeting=0`

const useQuery = require('./query_excecute')

const { sendMsg } = require('../server/sendSms/SendSms');
const moment = require('moment');

useQuery(q, (err, isolated) => {
    if (err) throw err;
    let isolater;
    let count = 0;
    for (let i = 0; i < isolated.length; i++) {
        isolater = isolated[i];
        date = isolater.meetingStartTime ? moment(isolater.meetingStartTime).format('HH:mm') : null
        msg = isolater.blowerName ?
            `שלום ${isolater.name}\n${isolater.blowerName}, בעל תוקע ממיזם "יום תרועה" יגיע אליך בראש השנה לתקוע עבורך בשופר.\nבכתובת: ${isolater.meetingAddress} ${isolater.addressComments || ""}\n${isolater.isPublicMeeting ? "מתחת לחלון ביתך" : "בפתח ביתך"}\nשעת תקיעה משוערת ${date}\nבריאות טובה\nשנה טובה ומתוקה!`
            : `שלום ${isolater.name}, טרם נמצא לך תוקע, צוות "יום תרועה" על זה (;`
        sendMsg(isolater.phoneNumber, msg)
        console.log(`-> \ncalling send msg to _isolater_ with: phoneNumber:${isolater.phoneNumber}, msg: ${msg}\n<-\n`);
        count++;
        if (isolated.length - 1 == i) { //in last place 
            console.log('script is done, send msg to ', count, ' isolated');
        }
    }
})