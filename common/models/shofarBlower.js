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
            if (!userId || isNaN(Number(userId)) || !meetingId || isNaN(Number(meetingId))) {
                return false;
            }
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
            blowerEvents.deleteMeeting(ShofarBlower, meetToDelete, isMeetingDeleted, isolatedConnected);
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
                    where += ` AND (MATCH(cu.address) AGAINST ('"${filter.address}"')) `
                }
                if (filter.name && filter.name.length > 0) {
                    where += ` AND (MATCH(cu.name) AGAINST ('"${filter.name}"'))`
                }

                const shofarBlowerQ = `
                SELECT 
                    cu.id AS userId, 
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
                    console.log('shofarblowererr get shofarBlower admin request error : ', shofarBlowerErr);
                    throw shofarBlowerErr
                }
                let [countErr, countRes] = await executeMySqlQuery(ShofarBlower, countQ);
                if (countErr || !countRes) {
                    console.log('countErr get shofarBlower admin request error : ', countErr);
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
                    console.log('confirmShofarBlower get shofarBlower admin request error : ', confirmErr);
                    throw shofarBlowerErr
                }

                const findPhone = `select username from CustomUser,shofar_blower where shofar_blower.id = ${id} and CustomUser.id=shofar_blower.userBlowerId`
                let [findPhoneErr, findPhoneRes] = await executeMySqlQuery(ShofarBlower, findPhone);
                let objToSocketEvent = { "id": id };
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
                await ShofarBlower.app.models.Isolated.updateAll({ and: [{ public_meeting: 0 }, { blowerMeetingId: userId }] }, { blowerMeetingId: null, meeting_time: null });
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
                const shofarBlowersQ = `SELECT cu.name, cu.address, cu.lat, cu.lng, cu.id AS "userId" 
                FROM shofar_blower AS sb 
                LEFT JOIN CustomUser cu ON sb.userBlowerId = cu.id 
                WHERE sb.confirm = 1`

                let [shofarBlowersErr, shofarBlowersRes] = await executeMySqlQuery(ShofarBlower, shofarBlowersQ);
                if (shofarBlowersErr || !shofarBlowersRes) {
                    console.log('getShofarBlowersForMap get shofarBlower admin request error : ', shofarBlowersErr);
                    throw shofarBlowersErr
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
                    console.log('countAllVolunteers get shofarBlower admin request error : ', countErr);
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


    ShofarBlower.adminGetSBRoute = function (options, sbId, withSBInfo, cb) {
        if (!options || !options.accessToken || !options.accessToken.userId) {
            return cb(true)
        }

        if (!sbId || isNaN(Number(sbId)) || sbId < 1) return cb("NO_SHOFAR_BLOWER"); // need shofar blower id

        (async () => {
            const myRouteQ = `
        SELECT * FROM (
            SELECT 
                FALSE AS isPublicMeeting, 
                isolated.id AS "meetingId",
                isolatedCU.name AS isolatedName, 
                isolatedCU.address, 
                isolatedCU.lng, isolatedCU.lat, 
                isolatedCU.comments,
                false AS constMeeting,
                IF(isolated.public_phone = 1, isolatedCU.username, NULL) isolatedPhone, 
                meeting_time AS "startTime",
                NULL AS "signedCnt"
            FROM isolated 
                JOIN CustomUser isolatedCU ON userIsolatedId = isolatedCU.id 
                JOIN CustomUser sbCU ON isolated.blowerMeetingId = sbCU.id
            WHERE isolated.public_meeting = 0 
                AND sbCU.id = ${sbId}
                
            UNION
                
            SELECT 
                TRUE AS isPublicMeeting, 
                shofar_blower_pub.id AS "meetingId", 
                NULL AS isolatedName, 
                shofar_blower_pub.address, 
                shofar_blower_pub.lng, shofar_blower_pub.lat, 
                shofar_blower_pub.comments,
                shofar_blower_pub.constMeeting AS constMeeting, 
                NULL AS isolatedPhone, 
                start_time AS "startTime",
                (SELECT COUNT(*) FROM isolated WHERE isolated.public_meeting=1 AND blowerMeetingId=shofar_blower_pub.id) AS "signedCnt"
            FROM shofar_blower_pub
                    LEFT JOIN CustomUser blowerCU ON blowerCU.id = shofar_blower_pub.blowerId
                    LEFT JOIN shofar_blower ON blowerCU.id = shofar_blower.userBlowerId 
            WHERE shofar_blower.confirm = 1
                AND blowerCU.id = ${sbId}
        ) a
        ORDER BY startTime
        `

            let [errRoute, resRoute] = await executeMySqlQuery(ShofarBlower, myRouteQ)
            if (errRoute || !resRoute) { console.log("errRoute || !resRoute for myRouteQ", errRoute || !resRoute); return cb(true) }
            // console.log('resRoute: ', resRoute);
            if (withSBInfo) {
                const sbDataQ = `SELECT
                    cu.id, cu.name, cu.username AS "phone", cu.address, cu.lng, cu.lat, 
                    shofar_blower.can_blow_x_times, shofar_blower.volunteering_start_time, shofar_blower.volunteering_max_time
                FROM shofar_blower
                    LEFT JOIN CustomUser cu ON cu.id = shofar_blower.userBlowerId
                WHERE cu.id = ${sbId}
                `
                let [sbDataErr, sbData] = await executeMySqlQuery(ShofarBlower, sbDataQ)
                if (sbDataErr || !Array.isArray(sbData) || sbData.length != 1) {
                    console.log("sbDataErr: error getting user info about sb (admin): ", sbDataErr || sbData)
                }
                return cb(null, { meetings: resRoute, sbData: sbData[0] })
            } else {
                return cb(null, resRoute)
            }
        })()
    }

    ShofarBlower.remoteMethod('adminGetSBRoute', {
        http: { verb: 'post' },
        accepts: [{ arg: 'options', type: 'object', http: 'optionsFromRequest' }, { arg: "sbId", type: "number" }, { arg: "withSBInfo", type: "boolean" }],
        returns: { arg: 'res', type: 'boolean', root: true }
    })

    ShofarBlower.getShofarBlowerByIdAdmin = function (id, cb) {
        (async () => {
            try {
                const shofarBlowerQ = `
                SELECT 
                    sb.id, 
                    cu.id AS userId,
                    cu.id AS userId, 
                    cu.name, 
                    cu.username AS phone, 
                    sb.can_blow_x_times AS blastsNum, 
                    sb.volunteering_start_time AS chosenTime, 
                    cu.address, 
                    cu.lat,
                    cu.lng,
                    sb.volunteering_max_time AS walkTime 
                FROM shofar_blower AS sb 
                    LEFT JOIN CustomUser cu ON sb.userBlowerId = cu.id
                WHERE sb.id = ${id}
                `
                let [shofarBlowerErr, shofarBlowerRes] = await executeMySqlQuery(ShofarBlower, shofarBlowerQ);
                if (shofarBlowerErr || !shofarBlowerRes) {
                    console.log('shofarBlowerAllVolunteers get shofarBlower admin request error : ', shofarBlowerErr);
                    throw shofarBlowerErr
                }
                if (!shofarBlowerRes[0]) throw 'shofar blower not exist'
                const shofarBlowerPubQ = `
                SELECT id, address, comments, start_time ,lat, lng
                FROM shofar_blower_pub 
                WHERE blowerId = ${shofarBlowerRes[0].userId}
                `
                let [shofarBlowerPubErr, shofarBlowerPubRes] = await executeMySqlQuery(ShofarBlower, shofarBlowerPubQ);
                if (shofarBlowerPubErr || !shofarBlowerPubRes) {
                    console.log('shofarBlowerPubAllVolunteers get shofarBlowerPub admin request error : ', shofarBlowerPubErr);
                    throw shofarBlowerPubErr
                }
                for (let i of shofarBlowerPubRes) {
                    i.address = [i.address, { lat: i.lat, lng: i.lng }]
                    delete i.lat
                    delete i.lng
                }

                shofarBlowerRes[0].address = [shofarBlowerRes[0].address, { lat: Number(shofarBlowerRes[0].lat), lng: Number(shofarBlowerRes[0].lng) }]
                delete shofarBlowerRes[0].lat
                delete shofarBlowerRes[0].lng
                shofarBlowerRes[0].publicPlaces = shofarBlowerPubRes
                return cb(null, shofarBlowerRes[0])

            } catch (err) {
                cb(err);
            }
        })()
    }

    ShofarBlower.remoteMethod('getShofarBlowerByIdAdmin', {
        http: { verb: 'post' },
        accepts: [{ arg: 'id', type: 'number' }],
        returns: { arg: 'res', type: 'number', root: true }
    });
}