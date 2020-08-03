const sendMsg = async (phoneNum, pincode) => {
    const https = require('https');

    const messageText = encodeURIComponent(`${pincode}`);//"איזה יופי שאתה מצטרף למאגר המתנדבים, הנה קוד האימות שלך: " + pincode;
    const data = `<?xml version="1.0" encoding="UTF-8"?><sms><user><username>Fb9KF2fX</username><password>RX70n5eE</password></user><source>Shofar2all</source><destinations><phone>${phoneNum}</phone></destinations><message>${messageText}</message><response>0</response></sms>`;
    const options = { hostname: 'www.019sms.co.il', port: 443, path: '/api', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } };

    const req = https.request(options, res => {

        res.on('data', d => {
            // process.stdout.write(d)
        });
    })

    req.on('error', error => {
    });

    req.write(data);
    // console.log("req", req);
    req.end();
}
module.exports = { sendMsg };