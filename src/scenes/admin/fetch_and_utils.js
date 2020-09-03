import Auth from '../../modules/auth/Auth'
import { CONSTS } from '../../consts/const_messages'

export const fetchIsolateds = async (limit, filter = {}, cb = () => { }) => {
    if (!filter) filter = {}
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

export const fetchShofarBlowers = async (limit, filter = {}, cb = () => { }) => {
    if (!filter) filter = {}
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/getShofarBlowersForAdmin`, {
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
        return cb(null, res)
    }
}

export const fetchBlastsPrivate = async (limit, filter = '', cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getPrivateMeetings`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ limit, filter })
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
    min = date.getMinutes() === 0 ? "00" : min
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

export const getParticipantsMeeting = async (id, limit, filter = '', cb = () => { }) => {
    console.log(id, limit, filter)
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getParticipantsMeeting`, {
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id, limit, filter })
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
        body: JSON.stringify({ email, password,code })
    }, true);

    if (err || !res) {
        console.log(err)
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה בזמן הבאת הנתונים, אנא נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, res)
    }
}