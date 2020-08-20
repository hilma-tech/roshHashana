import Auth from '../../modules/auth/Auth'
import { CONSTS } from '../../consts/const_messages'

export const fetchIsolateds = async (limit, filter = '', cb = () => { }) => {
    if (!filter) filter = ''
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getIsolatedsForAdmin`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ limit, filter })
    }, true);
    if (typeof cb === "function") {
        if (err || !res) {
            return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
        }
        else {
            return cb(null, res)
        }
    }
}

export const fetchBlastsPub = async (limit, filter = '', cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowerPubs/getPublicMeetings`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ limit, filter })
    }, true);
    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res.publicMeetings)
    }
}

export const getTime = (datatime) => {
    let date = new Date(datatime)
    return `${date.getHours()}:${date.getMinutes()}`
}