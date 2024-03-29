
import React from 'react';
import './about.scss'

const a1 = `הילמ"ה היא חברה לתועלת הציבור (ללא מטרות רווח), שהוקמה ע\"י בכירים בהייטק ב-2018, על מנת להפוך את ישראל למובילה עולמית בהיי-טק חברתי (Social-Tech).\n\nהילמ\"ה מפתחת פתרונות טכנולוגיים בתחומי בריאות, חינוך ורווחה בדגש על אוכלוסיות מוחלשות ואנשים עם מוגבלויות שונות ומכשירה מנהיגות טכנולוגית-חברתית מקרב אוכלוסיות צעירות - `
const carmel6000 = `בתכניות כרמל 6000 ומפנה 2525`
const a2 = ` (מעין ’8200’ של החברה האזרחית).\n\nהילמ\"ה, מפתחת את הפתרונות הטכנולוגיים עבור עמותות, בתי חולים ומשרדי ממשלה לשימוש אוכלוסיות היעד שלהם. באופן זה אנו מעצימים הן את האוכלוסיות המוחלשות ובעלי המוגבלויות שמשתמשים בפתרונות הטכנולוגיים והן את נותני השירותים החברתיים בישראל.\n\nלהילמ\"ה מרכז פיתוח תוסס בירושלים המאכלס 65 מפתחים צעירים 55 מתוכם הן נשים!`

const About = () => (
    <div id="about-container">
        <img src='/images/hilma.svg' alt='לוגו הילמ"ה' title='לוגו הילמ"ה' />
        <div>
            <h3>מוצר זה פותח</h3>
            <h3 className="bold">בהילמה - הייטק למען החברה</h3>
        </div>
        <div className="about-content">
            <p>{a1}<strong>{carmel6000}</strong>{a2}</p>
        </div>
        <a target="_blank" href="https://www.hilma.tech/"><button>www.hilma.tech</button></a>
    </div>
);

export default About;