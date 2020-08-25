const query =
    `SELECT CustomUser.name , CustomUser.username AS 'phoneNumber'
     FROM CustomUser 
            LEFT JOIN shofar_blower ON shofar_blower.confirm =1 
            LEFT JOIN RoleMapping ON RoleMapping.principalId= CustomUser.id     
     WHERE RoleMapping.roleId =2`;

const { sendMsg } = require('../server/sendSms/SendSms');
const useQuery = require('./query_excecute');
let msg = "";
useQuery(query, (err, data, _fields) => {
    if (err) throw err;
    console.log(data, 'data')
    for (let blower of data) {
        msg = `שלום ${blower.name}, שים לב, היום בשעה 00:00 תיסגר האפשרות לערוך את פרטייך ואת פרטי המסלול. בברכה, מיזם "יום תרועה"`;
        sendMsg(blower.phoneNumber, msg)
    }
});