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

export const getTime = (datatime) => {
    let date = new Date(datatime)
    return `${date.getHours()}:${date.getMinutes()}`
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
        return cb(err === "NO_INTERNET" ? CONSTS.NO_INTERNET_ACTION : "אירעה שגיאה, נא עברו על פרטי הרשמתכם או נסו שנית מאוחר יותר")
    }
    else {
        return cb(null, true)
    }
}

export const getNumVolunteers = async (cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/shofarBlowers/countAllVolunteers`, {
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

export const getParticipantsMeeting = async (id, cb = () => { }) => {
    let [res, err] = await Auth.superAuthFetch(`/api/isolateds/getParticipantsMeeting`, {
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