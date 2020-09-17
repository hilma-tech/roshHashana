
// send msg to all isolators
//checked
const q = `
    SELECT
        true AS "isPublicMeeting", RoleMapping.roleId, CustomUser.name, CustomUser.username AS "phoneNumber" , shofar_blower_pub.address AS "meetingAddress", CustomUser.comments AS "addressComments", shofar_blower_pub.start_time AS "meetingStartTime", blowerUser.name AS "blowerName"
    FROM isolated
        LEFT JOIN shofar_blower_pub ON isolated.blowerMeetingId=shofar_blower_pub.id
        LEFT JOIN CustomUser ON isolated.userIsolatedId= CustomUser.id
        LEFT JOIN CustomUser blowerUser ON blowerUser.id= shofar_blower_pub.blowerId
        LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
        LEFT JOIN RoleMapping ON RoleMapping.principalId = CustomUser.id
    WHERE isolated.public_meeting=1 AND (userIsolatedId=160 OR userIsolatedId=601)
UNION 
    SELECT
        false AS "isPublicMeeting", RoleMapping.roleId, CustomUser.name, CustomUser.username AS "phoneNumber", CustomUser.address AS "meetingAddress",CustomUser.comments AS "addressComments", isolated.meeting_time AS "meetingStartTime" ,blowerUser.name AS "blowerName"
    FROM isolated
        LEFT JOIN CustomUser ON CustomUser.id= isolated.userIsolatedId
        LEFT JOIN CustomUser blowerUser ON blowerUser.id=blowerMeetingId
        LEFT JOIN shofar_blower ON shofar_blower.id=isolated.blowerMeetingId
        LEFT JOIN RoleMapping ON RoleMapping.principalId = CustomUser.id
    WHERE isolated.public_meeting=0 AND (userIsolatedId=160 OR userIsolatedId=601)`

const useQuery = require('./query_excecute')

const { sendMsg } = require('../server/sendSms/SendSms');
const moment = require('moment');

useQuery(q, (err, isolated) => {
    if (err) throw err;
    let isolater;
    let count = 0;
    for (let i = 0; i < isolated.length; i++) {
        isolater = isolated[i];
        let dt = new Date(isolater.meetingStartTime)
        date = isolater.meetingStartTime ? moment(dt.setHours(dt.getHours() + 3)).format('HH:mm') : null
        msg = `שעת התקיעה המעודכנת היא: ${date},\nבברכה,\nצוות יום תרועה`;

        if (!isolater.blowerName)
            continue;
        console.log(isolater.name)
        console.log('date', moment(dt.setHours(dt.getHours() + 3)).format('HH:mm'))
        console.log('wrong date', isolater.meetingStartTime)
        // isolater.blowerName ?
        //     `שלום ${isolater.name},\n${isolater.blowerName}, בעל תוקע ממיזם "יום תרועה" יגיע אליך בעז"ה בראש השנה לתקוע עבורך בשופר.\nבכתובת: ${isolater.meetingAddress} ${isolater.addressComments || ""},\n${isolater.isPublicMeeting ? "מתחת לחלון ביתך" : "בפתח ביתך"}.\nשעת תקיעה משוערת ${date}.\nשנה טובה ומתוקה, צוות יום תרועה!`
        //     : `שלום ${isolater.name},\nלא הצלחנו למצוא לך בעל תוקע, עמך הסליחה, צוות יום תרועה`;
        // if (isolater.roleId == 3 && isolater.isPublicMeeting)
        // msg = `שלום ${isolater.name},\nנרשמת לתקיעה ציבורית בכתובת: ${isolater.meetingAddress}, ${isolater.addressComments || ""}.\n${isolater.blowerName}, בעל תוקע ממיזם "יום תרועה" יגיע אליך בעז"ה בראש השנה לתקוע בשופר בתקיעה ציבורית זו.\nשעת תקיעה משוערת ${date}.\nשנה טובה ומתוקה, צוות יום תרועה!`;

        // console.log(`(isolator) sending msg to:${isolater.phoneNumber}`);
        sendMsg(isolater.phoneNumber, msg)
        // count++;
        // if (isolated.length - 1 == i) { //in last place 
        //     console.log('script is done, sent msg to ', count, ' isolators');
        // }
    }
})