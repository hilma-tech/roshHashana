
//send msg to all confirmed blowers that they are confirmed
const query =
    `SELECT CustomUser.name , CustomUser.username AS 'phoneNumber'
     FROM CustomUser 
            LEFT JOIN shofar_blower ON shofar_blower.userBlowerId= CustomUser.id 
            LEFT JOIN RoleMapping ON RoleMapping.principalId= CustomUser.id     
     WHERE RoleMapping.roleId =2 AND shofar_blower.confirm =1`;

const { sendMsg } = require('../server/sendSms/SendSms');
const useQuery = require('./query_excecute');
let msg = "";
useQuery(query, (err, data, _fields) => {
    if (err) throw err;
    let cnt = 0;
    for (let i = 0; i < data.length; i++) {
        let blower = data[i];
        msg = `שלום ${blower.name},\nאנו שמחים להודיעך כי אושרת לתקוע בשופר באתר יום תרועה.\nתוכל כעת להיכנס לאתר ולשבץ את עצמך למחפשים ולתקיעות https://shofar2all.com ("אתר יום תרועה").\nבברכת שנה טובה,\nצוות יום תרועה`;
        sendMsg(blower.phoneNumber, msg)
        console.log('sendMsg to: ', blower.phoneNumber);
        cnt++
        if (data.length - 1 == i) //in last place 
            console.log("script is done, send msg to", cnt, ' shofar blowers')
    }
});
