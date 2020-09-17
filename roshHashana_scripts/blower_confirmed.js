
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
// useQuery(query, (err, data, _fields) => {
//     if (err) throw err;
//     let cnt = 0;
//     for (let i = 0; i < data.length; i++) {
//         let blower = data[i];
// msg = `שלום ${blower.name},\nאנו שמחים להודיעך כי אושרת לתקוע בשופר באתר יום תרועה.\nתוכל כעת להיכנס לאתר ולשבץ את עצמך למחפשים, בכתובת https://shofar2all.com ("אתר יום תרועה").\nבברכת שנה טובה,\nצוות יום תרועה`;
// msg = `שלום ${blower.name} כדי שתוכל לקבל אישור רשמי מול משטרת ישראל לצאת לתקוע בשופר בזמן הסגר עליך להיכנס לקישור הבא של משרד הדתות ולמלא את הפרטים עד היום בשעה 19:00-\nhttps://survey.gov.il/he/PassRequest.\n בעת מילוי השאלון הכנס בשדה שם בית הכנסת:'הילמ"ה תקיעה למבודדים' ובשדה כתובת בית הכנסת הכנס: 'כל הארץ'.\n `
// msg = `לאחר מילוי השאלון תתבקש להעלות קובץ של אישור בית הכנסת.\n אנא העלה את הקובץ שנמצא בקישור הבא: https://drive.google.com/file/d/1sXjuaEsqFoy97JsFUnoTSEzkE-iGiZnL/view?usp=sharing.\n במקרה של תקלה ניתן לפנות אלינו במייל ולצרף מספר פלאפון: shofar2all@gmail.com\n בברכת שנה טובה,\nצוות יום תרועה`;
msg = `שלום ${'blower.name'}, \nתודה על הנכונות שלך לעזור!\nהמסלול שלך מוכן ומחכה לך באתר שלנו.\nניתן לצפות במסלול המלא ולהדפיס אותו באתר שלנו https://shofar2all.com/?p=t \nאנו ממליצים ליצור קשר עם המחפשים לפני החג.\nאם אינך יכול/מצליח לראות את מסלולך אנא שלח לנו מייל לכתובת: shofar2all@gmail.com.\nבברכה, מיזם "יום תרועה".`;
sendMsg('0547443860', msg)
//         console.log('sendMsg to: ', blower.phoneNumber);
//         cnt++
//         if (data.length - 1 == i) //in last place 
//             console.log("script is done, sent msg to", cnt, ' shofar blowers')
//     }
// });
