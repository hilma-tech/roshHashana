const query = '';

const { sendMsg } = require('../server/sendSms/SendSms');
const useQuery = require('./query_excecute');
let msg = "";
useQuery(query, (err, data, _fields) => {
    if (err) throw err;
    for (let blower of data) {
        msg = `שלום ${blower.name}, המסלול שלך מוכן ומחכה לך באתר שלנו https://shofar2all.com  שם תוכל לצפות בו ולהדפיסו. בברכה, מיזם "יום תרועה"`;
        sendMsg(blower.phoneNumber, msg)
    }
});