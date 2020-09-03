import Auth from '../../modules/auth/Auth'
import { CONSTS } from '../../consts/const_messages'

export const fetchIsolateds = async (startRow, filter = {}, cb = () => { }) => {
    if (!filter) filter = {}
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getIsolatedsForAdmin`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ startRow, filter })
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

export const fetchShofarBlowers = async (startRow, filter = {}, cb = () => { }) => {
    if (!filter) filter = {}
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/getShofarBlowersForAdmin`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ startRow, filter })
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

export const fetchBlastsPub = async (startRow, filter = '', cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowerPubs/getPublicMeetings`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ startRow, filter })
    }, true);
    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const fetchBlastsPrivate = async (startRow, filter = '', cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getPrivateMeetings`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ startRow, filter })
    }, true);
    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const getTime = (datatime) => {
    let date = new Date(datatime)
    // console.log(datatime, date.getMinutes())
    let hours = date.getHours()
    let min = date.getMinutes()
    if (min < 10) {
        min = "0" + min
    }
    return `${hours}:${min}`
}

export const deletePublicMeeting = async (meetingId, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowerPubs/deletePublicMeeting`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ meetingId })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const deleteIsolated = async (id, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/deleteIsolatedAdmin`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, true)
    }
}

export const getNumVolunteers = async (confirm, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/countAllVolunteers`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ confirm })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const getNumberOfIsolatedWithoutMeeting = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getNumberOfIsolatedWithoutMeeting`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res[0].resNum)
    }
}

export const getNumberOfMeetings = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getNumberOfMeetings`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const getParticipantsMeeting = async (id, startRow, filter = '', cb = () => { }) => {
    console.log(id, startRow, filter)
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getParticipantsMeeting`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id, startRow, filter })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const setConfirmShofarBlower = async (id, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/confirmShofarBlower`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const deleteConectionToMeeting = async (id, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/deleteConectionToMeeting`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const deleteShofarBlower = async (id, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/deleteShofarBlowerAdmin`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id })
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, true)
    }
}

export const fetchShofarBlowersForMap = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/getShofarBlowersForMap`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({})
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה בזמן הבאת הנתונים, אנא נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const createAdminUser = async (email, password, code, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/createAdminUser`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ email, password, code })
    }, true);

    if (err || !res) {
        console.log(err)
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה בזמן הבאת הנתונים, אנא נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const adminGetSBRoute = async (sbId, withSBInfo = false) => {
    let [res, err] = await Auth.superAuthFetch('/api/ShofarBlowers/adminGetSBRoute', {
        headers: { Accept: "application/json", "Content-Type": "application/json" }, method: "POST", body: JSON.stringify({ sbId, withSBInfo: withSBInfo ? true : false })
    }, true);
    return new Promise((resolve, reject) => {
        if (err || !res) {
            resolve([true, null])
            return;
        }
        resolve([null, res])
    });
}

export const adminAssignSBToIsolator = async (sb, isolator) => {
    let [res, err] = await Auth.superAuthFetch('/api/CustomUsers/adminAssignSBToIsolator', {
        headers: { Accept: "application/json", "Content-Type": "application/json" }, method: "POST", body: JSON.stringify({ sb, isolator })
    }, true);
    return new Promise((resolve, reject) => {
        if (err || !res) {
            resolve([true, null])
            return;
        }
        resolve([null, res])
    });
}

export const adminUpdateMaxDurationAndAssign = async (sb, isolator, newMaxTimeVal, cb) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/updateMaxDurationAndAssign`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ sb, isolator, newMaxTimeVal })
    })
    if (err || !res) {
        typeof cb === "function" && cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : true) //yes error
    }
    else {
        cb && typeof cb === "function" && cb(res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : false) //no error
    }
}

export const adminUpdateMaxRouteLengthAndAssign = (sb, isolator) =>{
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/adminUpdateMaxRouteLengthAndAssign`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ sb, isolator })
    })
    if (err || !res) {
        typeof cb === "function" && cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : true) //yes error
    }
    else
        cb && typeof cb === "function" && cb(null, res === CONSTS.CURRENTLY_BLOCKED_ERR ? CONSTS.CURRENTLY_BLOCKED_ERR : res)
}


export const fetchBlastsForMap = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/CustomUsers/getAllAdminBlastsForMap`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({})
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה בזמן הבאת הנתונים, אנא נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}

export const fetchIsolatedForMap = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getIsolatedsWithoutMeetingForMap`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({})
    }, true);

    if (err || !res) {
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה בזמן הבאת הנתונים, אנא נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}