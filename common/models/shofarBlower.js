'use strict';
const CONSTS = require('../../server/common/consts/consts');
const checkDateBlock = require('../../server/common/checkDateBlock');
const blowerEvents = require('../../server/common/socket/blowerEvents');
const to = require('../../server/common/to');

const executeMySqlQuery = async (Model, query) =>
    await to(new Promise((resolve, reject) => {
        Model.dataSource.connector.query(query, (err, res) => {
            if (err) {
                reject(err);
                return
            }
            resolve(res);
        });
    }));

module.exports = function (ShofarBlower) {
    const SHOFAR_BLOWER_ROLE = 2

    // {
    //         "can_blow_x_times":1,
    //         "volunteering_start_time":1594563291554,
    //         "volunteering_max_time":1594563291554,
    //         "address",
    //         "comments": null
    //     }
    ShofarBlower.InsertDataShofarBlower = async (data, options) => {
        if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            //block the function
            return CONSTS.CURRENTLY_BLOCKED_ERR;
        }

        if (options.accessToken && options.accessToken.userId) {
            try {
                let blowerInfo = await ShofarBlower.findOne({ where: { "userBlowerId": options.accessToken.userId } });
                if (!blowerInfo) {
                    if (!Array.isArray(data.address) || data.address.length !== 2) { console.log("ADDRESS NOT VALID"); return { ok: false, err: "כתובת אינה תקינה" } }
                    if (!data.address[0] || data.address[0] === "NOT_A_VALID_ADDRESS" || typeof data.address[1] !== "object" || !data.address[1].lng || !data.address[1].lat) { console.log("ADDRESS NOT VALID"); return { ok: false, err: 'נא לבחור מיקום מהרשימה הנפתחת' } }
                    data.address[0] = data.address[0].substring(0, 398) // shouldn't be more than 400 
                    if (data.address && data.address[0]) {
                        let addressArr = data.address[0]
                        if (typeof addressArr === "string" && addressArr.length) {
                            addressArr = addressArr.split(", ")
                            let city = ShofarBlower.app.models.CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1);
                            data.city = city || addressArr[addressArr.length - 1];
                        }
                    }
                    let objToBlower = {
                        "userBlowerId": options.accessToken.userId,
                        "can_blow_x_times": data.can_blow_x_times,
                        "volunteering_start_time": data.volunteering_start_time,
                        "volunteering_max_time": data.volunteering_max_time
                    },
                        objToCU = {
                            "address": data.address[0],
                            "city": data.city,
                            "lng": data.address[1].lng,
                            "lat": data.address[1].lat,
                            "comments": null
                        };

                    let resRole = await ShofarBlower.app.models.RoleMapping.findOne({ where: { principalId: options.accessToken.userId } });
                    if (resRole.roleId === SHOFAR_BLOWER_ROLE) {
                        let resBlower = await ShofarBlower.create(objToBlower)
                        let resCU = await ShofarBlower.app.models.CustomUser.updateAll({ id: options.accessToken.userId }, objToCU);
                        //if the shofar blower added publicPlaces,
                        if (data.publicPlaces) {
                            let [errPublicMeetings, resPublicMeetings] = await to(ShofarBlower.app.models.shofarBlowerPub.createNewPubMeeting(data.publicPlaces, options.accessToken.userId, options, true));
                            if (errPublicMeetings) { console.log("errPublicMeetings", errPublicMeetings); return { ok: false } }
                            if (resPublicMeetings) { console.log("resPublicMeetings", resPublicMeetings); }
                        }
                        return { ok: true };
                    } else {
                        return { ok: false, err: "No permissions" };
                    }
                }
            } catch (error) {
                console.log("Can`t create new isolated", error);
                throw error;
            }
        }
    }

    //delete meeting from blower meetings
    ShofarBlower.deleteMeeting = async (meetToDelete, options) => {
        if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            //block the function
            return CONSTS.CURRENTLY_BLOCKED_ERR;
        }
        if (!options.accessToken || !options.accessToken.userId) {
            return false;
        }
        try {
            let isolatedConnected = null; //the phone number of the isolated connected to the meeting (role 1)
            let isMeetingDeleted = false; //A variable that identifies whether the meeting has been completely deleted
            const { userId } = options.accessToken;
            const { meetingId } = meetToDelete;
            if (meetToDelete.isPublicMeeting) {//public meeting
                let participantsNum = await ShofarBlower.app.models.Isolated.count({ and: [{ 'blowerMeetingId': meetingId }, { public_meeting: 1 }] });
                if (participantsNum && participantsNum > 0) { //there are  participants in this meeting
                    //only delete the connection between the blower and the meeting
                    //general users who are connected to this meeting will be deleted once they log in
                    //TODO:   לעבור על כל הפגישות הציבוריות של הבעל תוקע ולמחוק את הפגישות שמחק 
                    await ShofarBlower.app.models.shofarBlowerPub.upsertWithWhere({ id: meetingId }, { blowerId: null, constMeeting: 0, start_time: null });
                    let isolated = await ShofarBlower.app.models.isolated.findOne({ where: { and: [{ blowerMeetingId: meetingId }, { public_meeting: 1 }] }, include: ['UserToIsolated'] });
                    if (isolated) {
                        isolatedConnected = isolated.UserToIsolated().username;
                    }
                }
                else {//there are no participants in this meeting, delete this meeting
                    await ShofarBlower.app.models.shofarBlowerPub.destroyById(meetingId);
                    isMeetingDeleted = true;
                }
            }
            else {
                let isolated = await ShofarBlower.app.models.isolated.findOne({ where: { and: [{ blowerMeetingId: userId }, { public_meeting: 0 }, { id: meetingId }] }, include: ['UserToIsolated'] });
                //private meeting -> change blowerMeetingId to null -> 
                //only delete the connection between the blower and the meeting
                await ShofarBlower.app.models.Isolated.upsertWithWhere({ and: [{ blowerMeetingId: userId }, { public_meeting: 0 }, { id: meetingId }] }, { blowerMeetingId: null, meeting_time: null });
                if (isolated) {
                    isolatedConnected = isolated.UserToIsolated().username;
                }
            }
            //call socket
            await blowerEvents.deleteMeeting(ShofarBlower, meetToDelete, isMeetingDeleted, isolatedConnected);
            return true;
        } catch (error) {
            throw error;
            // return false
        }
    }

    ShofarBlower.remoteMethod('InsertDataShofarBlower', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: "optionsFromRequest" }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    ShofarBlower.remoteMethod('deleteMeeting', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'meetToDelete', type: 'object' },
            { arg: 'options', type: 'object', http: "optionsFromRequest" }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });







    //admin

    ShofarBlower.getShofarBlowersForAdmin = function (startRow, filter, cb) {
        (async () => {
            try {
                let where = ''

                if (filter.confirm) {
                    where = 'WHERE (sb.confirm = 1)'
                }
                else {
                    where = 'WHERE (sb.confirm = 0)'
                }

                if (filter.address && filter.address.length > 0) {
                    where += ` AND (MATCH(cu.address) AGAINST ('${filter.address}')) `
                }
                if (filter.name && filter.name.length > 0) {
                    where += ` AND (MATCH(cu.name) AGAINST ('${filter.name}'))`
                }

                const shofarBlowerQ = `
                SELECT 
                    sb.id, 
                    sb.volunteering_max_time,
                    sb.volunteering_start_time AS "startTime", 
                    sb.can_blow_x_times,
                    cu.name,
                    cu.username,
                    cu.address,
                    cu.lng,
                    cu.lat,
                    ((SELECT COUNT(*) FROM shofar_blower_pub WHERE blowerId = cu.id)+(SELECT COUNT(*) FROM isolated WHERE public_meeting = 0 AND blowerMeetingId = cu.id)) AS blastsNum
                FROM shofar_blower AS sb 
                    LEFT JOIN CustomUser cu ON sb.userBlowerId = cu.id
                ${where}
                ORDER BY cu.name
                LIMIT ${startRow}, 7`

                const countQ = `SELECT COUNT(*) as resNum
                FROM shofar_blower AS sb
                LEFT JOIN CustomUser cu ON sb.userBlowerId = cu.id
                ${where}`

                let [shofarBlowerErr, shofarBlowerRes] = await executeMySqlQuery(ShofarBlower, shofarBlowerQ);
                if (shofarBlowerErr || !shofarBlowerRes) {
                    console.log('get shofarBlower admin request error : ', shofarBlowerErr);
                    throw shofarBlowerErr
                }
                let [countErr, countRes] = await executeMySqlQuery(ShofarBlower, countQ);
                if (countErr || !countRes) {
                    console.log('get shofarBlower admin request error : ', countErr);
                    throw countErr
                }

                return cb(null, { shofarBlowers: shofarBlowerRes, resNum: countRes[0].resNum })
            }
            catch (err) {
                cb(err);
            }
        })()
    }

    ShofarBlower.remoteMethod('getShofarBlowersForAdmin', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'startRow', type: 'number' },
            { arg: 'filter', type: 'object' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    ShofarBlower.confirmShofarBlower = function (id, cb) {
        (async () => {
            try {
                const confirmQ = `UPDATE shofar_blower SET confirm = 1 WHERE id = ${id}`
                let [confirmErr, confirmRes] = await executeMySqlQuery(ShofarBlower, confirmQ);
                if (confirmErr || !confirmRes) {
                    console.log('get shofarBlower admin request error : ', confirmErr);
                    throw shofarBlowerErr
                }
                
                const findPhone = `select username from CustomUser,shofar_blower where shofar_blower.id = ${id} and CustomUser.id=shofar_blower.userBlowerId`
                let [findPhoneErr, findPhoneRes] = await executeMySqlQuery(ShofarBlower, findPhone);
                let objToSocketEvent= {"id" :id};
                ShofarBlower.app.io.to('admin-blower-events').emit(`blower_true_confirmQ_${findPhoneRes[0].username}`)
                return cb(null, true)
            } catch (err) {
                cb(err);
            }
        })()
    }

    ShofarBlower.remoteMethod('confirmShofarBlower', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'id', type: 'number' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    ShofarBlower.deleteShofarBlowerAdmin = function (id, cb) {
        (async () => {
            try {
                let userData = await ShofarBlower.findById(id, { fields: { userBlowerId: true } });
                const userId = userData.userBlowerId;

                let [errPublicMeeting, resPublicMeeting] = await executeMySqlQuery(ShofarBlower,
                    `select count(isolated.id) as participantsNum , shofar_blower_pub.id as meetingId, blowerId as userId
                         from isolated right join shofar_blower_pub on  shofar_blower_pub.id = isolated.blowerMeetingId 
                         where (blowerId = ${userId}) 
                         group by shofar_blower_pub.id `);
                if (resPublicMeeting && Array.isArray(resPublicMeeting)) {
                    let meetingsToUpdate = [], meetingsToDelete = [];

                    //sort all public meetings according to delete or update
                    for (let i in resPublicMeeting) {
                        const meet = resPublicMeeting[i];
                        if (meet.participantsNum > 0) meetingsToUpdate.push(meet.meetingId);
                        else meetingsToDelete.push(meet.meetingId);
                    }
                    //change blower id in the meeting to null
                    meetingsToUpdate.length > 0 && await ShofarBlower.app.models.shofarBlowerPub.updateAll({ id: { inq: meetingsToUpdate } }, { blowerId: null });
                    //delete the meeting
                    meetingsToDelete.length > 0 && await ShofarBlower.app.models.shofarBlowerPub.destroyAll({ id: { inq: meetingsToDelete } });
                }
                await ShofarBlower.app.models.Isolated.updateAll({ where: { and: [{ public_meeting: 0 }, { blowerMeetingId: userId }] } }, { blowerMeetingId: null, meeting_time: null });
                //TODO: להודיע למבודדים שבוטלה להם הפגישה
                await ShofarBlower.destroyById(id);

                await ShofarBlower.app.models.CustomUser.destroyById(userId);

                return cb(null, 'SUCCESS');

            } catch (error) {
                console.log(error);
                return cb(error);
            }
        })()
    }

    ShofarBlower.remoteMethod('deleteShofarBlowerAdmin', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'id', type: 'number', require: true },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    ShofarBlower.InsertDataShofarBlowerAdmin = async (data, options) => {
        try {
            const userId = data.userId
            delete data.userIs
            let blowerInfo = await ShofarBlower.findOne({ where: { "userBlowerId": userId } });
            if (!blowerInfo) {
                if (!Array.isArray(data.address) || data.address.length !== 2) { console.log("ADDRESS NOT VALID"); return { ok: false, err: "כתובת אינה תקינה" } }
                if (!data.address[0] || data.address[0] === "NOT_A_VALID_ADDRESS" || typeof data.address[1] !== "object" || !data.address[1].lng || !data.address[1].lat) { console.log("ADDRESS NOT VALID"); return { ok: false, err: 'נא לבחור מיקום מהרשימה הנפתחת' } }
                data.address[0] = data.address[0].substring(0, 398) // shouldn't be more than 400 
                if (data.address && data.address[0]) {
                    let addressArr = data.address[0]
                    if (typeof addressArr === "string" && addressArr.length) {
                        addressArr = addressArr.split(", ")
                        let city = ShofarBlower.app.models.CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1);
                        data.city = city || addressArr[addressArr.length - 1];
                    }
                }
                let objToBlower = {
                    "userBlowerId": userId,
                    "can_blow_x_times": data.can_blow_x_times,
                    "volunteering_start_time": data.volunteering_start_time,
                    "volunteering_max_time": data.volunteering_max_time,
                    "confirm": true
                },
                    objToCU = {
                        "address": data.address[0],
                        "city": data.city,
                        "lng": data.address[1].lng,
                        "lat": data.address[1].lat,
                        "comments": null
                    };

                let resRole = await ShofarBlower.app.models.RoleMapping.findOne({ where: { principalId: userId } });

                let resBlower = await ShofarBlower.create(objToBlower)
                let resCU = await ShofarBlower.app.models.CustomUser.updateAll({ id: userId }, objToCU);
                //if the shofar blower added publicPlaces,
                if (data.publicPlaces) {
                    let [errPublicMeetings, resPublicMeetings] = await to(ShofarBlower.app.models.shofarBlowerPub.createNewPubMeeting(data.publicPlaces, userId, options, true));
                    if (errPublicMeetings) { console.log("errPublicMeetings", errPublicMeetings); return { ok: false } }
                    if (resPublicMeetings) { console.log("resPublicMeetings", resPublicMeetings); }
                }
                return { ok: true };
            }
        } catch (error) {
            console.log("Can`t create new isolated", error);
            throw error;
        }
    }

    ShofarBlower.remoteMethod('InsertDataShofarBlowerAdmin', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: "optionsFromRequest" }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    ShofarBlower.getShofarBlowersForMap = function (cb) {
        (async () => {
            try {
                const shofarBlowersQ = `SELECT cu.name, cu.address, cu.lat, cu.lng, shofar_blower.id AS "sbId" 
                FROM shofar_blower AS sb 
                LEFT JOIN CustomUser cu ON sb.userBlowerId = cu.id 
                WHERE sb.confirm = 1`
                
                let [shofarBlowersErr, shofarBlowersRes] = await executeMySqlQuery(ShofarBlower, shofarBlowersQ);
                if (shofarBlowersErr || !shofarBlowersRes) {
                    console.log('get shofarBlower admin request error : ', shofarBlowersErr);
                    throw shofarBlowerErr
                }
                return cb(null, shofarBlowersRes)
            } catch (err) {
                cb(err);
            }
        })()
    }

    ShofarBlower.remoteMethod('getShofarBlowersForMap', {
        http: { verb: 'POST' },
        accepts: [],
        returns: { arg: 'res', type: 'object', root: true }
    });



    ShofarBlower.countAllVolunteers = function (confirm, cb) {
        (async () => {
            try {
                const countQ = `SELECT COUNT(*) AS num FROM shofar_blower AS sb  WHERE sb.confirm = ${confirm || 0}`
                let [countErr, countRes] = await executeMySqlQuery(ShofarBlower, countQ);
                if (countErr || !countRes) {
                    console.log('get shofarBlower admin request error : ', countErr);
                    throw shofarBlowerErr
                }
                return cb(null, countRes[0].num)
            } catch (err) {
                cb(err);
            }
        })()
    }

    ShofarBlower.remoteMethod('countAllVolunteers', {
        http: { verb: 'post' },
        accepts: [{ arg: 'confirm', type: 'boolean' }],
        returns: { arg: 'res', type: 'number', root: true }
    });
}