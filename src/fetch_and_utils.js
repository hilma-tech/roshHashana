import Auth from './modules/auth/Auth'
import { CONSTS } from './consts/const_messages'

//* UTILS are at bottom ...

export const updateSBDetails = async (blowerDetails, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/InsertDataShofarBlower`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ data: blowerDetails })
    }, true);
    if (err || !res || !res.ok && typeof cb === "function") {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    } else {
        typeof cb === "function" && cb(res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false)
    }

}

export const updateIsolatedDetails = async (isolatedDetails, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/InsertDataIsolated`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ data: isolatedDetails })
    }, true);
    if (res) {
        typeof cb === "function" && cb(res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false)
    } else if (err) return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : err)
}


export const assignSB = async (meetingObj, cb = () => { }) => {
    // if (checkDateBlock()) {
    //     cb(null, CONSTS.CURRENTLY_BLOCKED_ERR)
    //     return;
    // }

    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/assignSB`, {
        method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meetingObj })
    }, true);
    if (err || !res) {
        console.log("error assigning sb to meeting ", err);
        const error = err === "NO_INTERNET" ? "אין חיבור לאינטרנט, לא ניתן לבצע כעת" : "אירעה שגיאה, לא ניתן להשתבץ כרגע, נא נסו שנית מאוחר יותר"
        cb && typeof cb === "function" && cb(error)
        return
    }
    console.log("res assigning sb to meeting ", res);
    cb && typeof cb === "function" && cb(null, res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false)
    return
}

export const deleteUser = async (cb = () => { }) => {
    // if (checkDateBlock()) {
    //     cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
    //     return;
    // }
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/deleteUser`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "DELETE",
    });
    if (res && res.res === 'SUCCESS') {
        Auth.logout(window.location.href = window.location.origin);
        typeof cb === "function" && cb(res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false) //no error
    }
    else
        typeof cb === "function" && cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "סליחה, הפעולה נכשלה, נא נסו שנית מאוחר יותר") //yes error
}

export const updateMyStartTime = async (obj, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/updateMyStartTime`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ meetings: obj })
    })
    if (err || !res) {
        typeof cb === "function" && cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : err === "ONE_UPDATE_ERROR_AT_LEAST" ? "קרתה בעיה, ייתכן וחלק מהשינויים לא נשמרו כראוי, נא רעננו ובמידת הצורך חזרו על פעולתכם האחרונה" : false) //yes error
    }
    else
        typeof cb === "function" && cb(res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false) //no error

}


export const updateMaxDurationAndAssign = async (meetingObj, newMaxTimeVal, cb) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateMaxDurationAndAssign`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ meetingObj, newMaxTimeVal })
    })
    if (err || !res) {
        typeof cb === "function" && cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : true) //yes error
    }
    else
        cb && typeof cb === "function" && cb(res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false) //no error
}

export const updateMaxRouteLengthAndAssign = async (meetingObj, cb) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateMaxRouteLengthAndAssign`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ meetingObj })
    })
    if (err || !res) {
        typeof cb === "function" && cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : true) //yes error
    }
    else
        cb && typeof cb === "function" && cb(null, res)
}





// ***************************** UTILS ********************************** //
export const dateFormatChange = (date, noDay) => {
    // changes date to the format: dd/mm/yy
    let arr = []
    try {
        date = date.substring(0, 10);
        arr = date.split(/\-/g);
        date = `${arr[1]}/${arr[0]}`
    } catch (e) { date = "" }
    return noDay ? date : `${arr[2]}/${date}`
}

export const dateWTimeFormatChange = (date) => {
    // date ~= 2020-06-25T13:36:52.000Z
    let dmy = dateFormatChange(date)
    let formatted = [];
    try {
        formatted = [dmy, date.split("T")[1].substring(0, 5)]
    } catch (e) { formatted = [] }
    return formatted
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

export const splitJoinAddressOnIsrael = (address) => {
    return address.split(", ישראל").join('') // maybe add a split on ישראל only
}

export const checkDateBlock = () => {
    let now = new Date(Date.now());
    if (Date.parse(CONSTS.DATE_TO_BLOCK) < Date.parse(now)) {
        //CONSTS.DATE_TO_BLOCK is less than now
        //block
        return true;
    } else {
        //now is less than CONSTS.DATE_TO_BLOCK
        return false;
    }

}