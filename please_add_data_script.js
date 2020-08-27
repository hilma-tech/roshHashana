const { sendMsg } = require('./server/sendSms/SendSms');
let mysql = require('mysql');
const usersWithNoDataQuery = `SELECT CustomUser.name , CustomUser.username AS 'phoneNumber', RoleMapping.roleId 
             FROM CustomUser 
                LEFT JOIN RoleMapping ON RoleMapping.principalId = CustomUser.id 
             WHERE (RoleMapping.roleId = 1 OR RoleMapping.roleId = 2) AND CustomUser.address IS NULL;
`
let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "z10mz10m",
    database: "roshHashana"
});

let msg = '';
con.connect(err => {
    if (err) throw err
    con.query(usersWithNoDataQuery, (err, users, _fields) => {
        if (err) throw err;
        for (let user of users) {
            if (user.roleId == 2) {// the user is shofar blower
                msg = `שלום, \nנראה כי לא סיימת את הרשמתך כבעל תוקע. \nלהמשך הרשמה אנא הכנס לקישור https://shofar2all.com והשלם את הפרטים החסרים.\nלפניות ובקשות נוספות, ניתן ליצור קשר במייל ב shofar2all@gmail.com.\nתודה ושנה טובה, צוות יום תרועה`;
                sendMsg(user.phoneNumber, msg)
                console.log("send to s_blower ", user.phoneNumber);
            } else if (user.roleId == 1) {
                msg = `שלום,\nראינו באתר שנרשמת על מנת שיתקעו עבורך בשופר. אך נראה כי לא סיימת את הרשמתך ולכן לא נוכל לסייע לך.\nלהמשך הרשמה אנא הכנס לקישור https://shofar2all.com והשלם את הפרטים החסרים. \nלפניות ובקשות נוספות, ניתן ליצור קשר במייל ב shofar2all@gmail.com. \nתודה ושנה טובה, צוות יום תרועה`;
                sendMsg(user.phoneNumber, msg)
                console.log("send to isolator ", user.phoneNumber);
            }
            else {
                msg = '';
                // return;
            }
        }
    });
});