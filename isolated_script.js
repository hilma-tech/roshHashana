const q = `SELECT
true AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber" , shofar_blower_pub.address AS "meetingAddress" ,shofar_blower_pub.start_time AS "meetingStartTime", blowerUser.name AS "blowerName"
FROM isolated
LEFT JOIN shofar_blower_pub ON isolated.blowerMeetingId=shofar_blower_pub.id
LEFT JOIN CustomUser ON isolated.userIsolatedId= CustomUser.id
LEFT JOIN CustomUser blowerUser ON blowerUser.id= shofar_blower_pub.blowerId
LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
WHERE isolated.public_meeting=1
UNION SELECT
false AS "isPublicMeeting", CustomUser.name, CustomUser.username AS "phoneNumber", CustomUser.address AS "meetingAddress",isolated.meeting_time AS "meetingStartTime" ,blowerUser.name AS "blowerName"
FROM isolated
LEFT JOIN CustomUser ON CustomUser.id= isolated.userIsolatedId
LEFT JOIN CustomUser blowerUser ON blowerUser.id=blowerMeetingId
LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
WHERE isolated.public_meeting=0`

let mysql = require('mysql');
const { sendMsg } = require('./server/sendSms/SendSms');
const moment = require('moment');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "z10mz10m",
    database: "roshHashana"
});

let msg = "";
let date;

con.connect(err => {
    if (err) throw err
    con.query(q, (err, isolated, _fields) => {
        if (err) throw err;
        for (let isolater of isolated) {
            date = isolater.meetingStartTime ? moment(isolater.meetingStartTime).format('MM/DD/YYYY HH:mm') : null
            msg = isolater.blowerName ? `שלום ${isolater.name}, נקבעה לך תקיעת שופר ביום שני של ראש השנה, ב' אלול ${date ? `בשעה ${date}` : "טרם נקבעה שעה"}, ב${isolater.meetingAddress} ע"י ${isolater.blowerName}` : "טרם נמצא לך תוקע, צוות האתר על זה (;"
            if (isolater.blowerName) { //! to remove if statement, this is just for testing cos in local sql got only one isolated with meeting 
                console.log('calling ');
                sendMsg(isolater.phoneNumber, msg)
            }
            console.log(`send msg to isolateds with: phoneNumber:${isolater.phoneNumber}, msg:${msg}`);
        }
    });
});