
const readFileSync = require('fs').readFileSync;
require('dotenv').config();
let password = null;

if (process.env.PASS019) {
    password = readFileSync(process.env.PASS019, 'utf-8');
}
else console.error("Missing pass")
// above lines have not been tested, but are the same as many other project who need the 019 password from a 019.txt file (location of the file is in process.env.PASS019)

const sendMsg = async (phoneNum, msg) => {
    const https = require('https');
    if (!password) { console.log("not sending sms, no password for 019"); return; }

    const messageText = encodeURIComponent(`${msg}`);//"איזה יופי שאתה מצטרף למאגר המתנדבים, הנה קוד האימות שלך: " + pincode;
    const data = `<?xml version="1.0" encoding="UTF-8"?><sms><user><username>Fb9KF2fX</username><password>${password}</password></user><source>Shofar2all</source><destinations><phone>${phoneNum}</phone></destinations><message>${messageText}</message><response>0</response></sms>`;
    const options = { hostname: 'www.019sms.co.il', port: 443, path: '/api', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } };
    console.log("not sending sms");
    // const req = https.request(options, res => {

    //     res.on('data', d => {
    //         // process.stdout.write(d)
    //     });
    // })

    // req.on('error', error => {
    // });

    // req.write(data);
    // // console.log("req", req);
    // req.end();
}
module.exports = { sendMsg };