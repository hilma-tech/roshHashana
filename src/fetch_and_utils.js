import Auth from './modules/auth/Auth'


export const assignSB = async (meetingObjs, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/assignSB`, {
        method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meetingObjs })
    }, true);
    if (err || !res) {
        const error = err === "NO_INTERNET" ? "אין חיבור לאינטרנט, לא ניתן לבצע כעת" : "אירעה שגיאה, לא ניתן להשתסץ כרגע, נא נסו שנית מאוחר יותר"
        console.log("error assigning sb to meeting ", err);
        cb && typeof cb === "function" && cb(error)
        return
    }
    cb && typeof cb === "function" && cb(null, res)
    return
}


export const dateFormatChange = (date, noDay) => {
    // changes date to the format: dd/mm/yy
    date = date.substring(0, 10);
    let arr = date.split(/\-/g);
    date = `${arr[1]}/${arr[0]}`
    return noDay ? date : `${arr[2]}/${date}`
}

export const dateWTimeFormatChange = (date) => {
    let dmy = dateFormatChange(date)
    // 2020-06-25T13:36:52.000Z
    return [dmy, date.split("T")[1].substring(0, 5)]
}

export const viewportToPixels = value => {
    var parts = value.match(/([0-9\.]+)(vh|vw)/)
    var q = Number(parts[1])
    var side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
    return side * (q / 100)
}