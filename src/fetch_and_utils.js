import Auth from './modules/auth/Auth'
import { CONSTS } from './consts/const_messages'


export const updateSBDetails = async (blowerDetails, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/InsertDataShofarBlower`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ data: blowerDetails })
    }, true);
    if (res) {
        typeof cb === 'function' && cb(false)
    }
}

export const updateIsolatedDetails = async (isolatedDetails, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/InsertDataIsolated`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ data: isolatedDetails })
    }, true);
    if (res) {
        typeof cb === "function" && cb(false)
    } else if (err) return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : err)
}


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

export const deleteUser = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "DELETE",
    });
    if (res && res.res === 'SUCCESS') {
        Auth.logout(window.location.href = window.location.origin);
        cb(false) //no error
    }
    else
        cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "סליחה, הפעולה נכשלה, נא נסו שנית מאוחר יותר") //yes error
}













// ***************************** UTILS ********************************** //
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

export const changePosition = (array, from, to) => {
    array = array.slice();
    array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
    return array;
}