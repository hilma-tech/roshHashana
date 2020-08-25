'use strict';
const CONSTS = require('../../server/common/consts/consts');
const checkDateBlock = require('../../server/common/checkDateBlock');
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

module.exports = function (Isolated) {
    const ISOLATED_ROLE = 1

    Isolated.InsertDataIsolated = async (data, options) => {
        if (checkDateBlock('DATE_TO_BLOCK_ISOLATED')) {
            //block the function
            return CONSTS.CURRENTLY_BLOCKED_ERR;
        }
        //socket.io event for isolated
        if (options.accessToken && options.accessToken.userId) {
            try {
                let isolatedInfo = await Isolated.findOne({ where: { "userIsolatedId": options.accessToken.userId } });
                if (!isolatedInfo) {
                    let pubMeetId = null;
                    if (!Array.isArray(data.address) || data.address.length !== 2) { console.log("ADDRESS NOT VALID"); return { ok: false, err: "כתובת אינה תקינה" } }
                    if (!data.address[0] || data.address[0] === "NOT_A_VALID_ADDRESS" || typeof data.address[1] !== "object" || !data.address[1].lng || !data.address[1].lat) { console.log("ADDRESS NOT VALID"); return { ok: false, err: 'נא לבחור מיקום מהרשימה הנפתחת' } }

                    data.address[0] = data.address[0].substring(0, 398) // shouldn't be more than 400 

                    let city;
                    let addressArr = data.address && data.address[0]
                    if (typeof addressArr === "string" && addressArr.length) {
                        addressArr = addressArr.split(", ")
                        city = Isolated.app.models.CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1) || addressArr[addressArr.length - 1];
                    }


                    //create public meeting
                    if (data.public_meeting) {
                        let meetData = [{
                            "address": data.address,
                            "comments": (data.comments && data.comments.length < 255) ? data.comments : '',
                            "start_time": null,
                            city
                        }]
                        pubMeetId = await Isolated.app.models.shofarBlowerPub.createNewPubMeeting(meetData, null, options);
                    }

                    let objToIsolated = {
                        "userIsolatedId": options.accessToken.userId,
                        "public_phone": data.public_phone,
                        "public_meeting": data.public_meeting,
                        "blowerMeetingId": pubMeetId
                    },
                        objToCU = {
                            "address": data.address[0],
                            "lng": data.address[1].lng,
                            "lat": data.address[1].lat,
                            "comments": (data.comments && data.comments.length < 255) ? data.comments : '',
                            city
                        };


                    let resRole = await Isolated.app.models.RoleMapping.findOne({ where: { principalId: options.accessToken.userId } });

                    if (resRole.roleId === ISOLATED_ROLE) {

                        let resIsolated = await Isolated.create(objToIsolated);
                        let resCU = await Isolated.app.models.CustomUser.updateAll({ id: options.accessToken.userId }, objToCU);
                        return { ok: true };
                    } else {
                        return { ok: false, err: "No permissions" };
                    }
                }
            } catch (error) {
                console.log("Can`t do create new isolated", error);
                throw error;

            }
        }
    }


    Isolated.remoteMethod('InsertDataIsolated', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    Isolated.updateMyStartTime = function (options, meetings, cb) {
        if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            //block the function
            return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR)
        }
        console.log('updateMyStartTime:');
        if (!options || !options.accessToken || !options.accessToken.userId) {
            console.log("NO_USER_ID_IN_OPTIONS in updateMyStartTime, meetings are:", meetings);
            return
        }
        (async () => {
            if (Isolated.checkMeetingToUpdate(meetings)) {
                let [uErr, uRes] = await singleStartTimeUpdate(meetings)
                if (uErr || !uRes) {
                    console.log('update (not array) start time error: ', uErr);
                    return cb(true)
                } else
                    return cb(null, true)
            }
            else if (Array.isArray(meetings)) {
                let errFlag = false
                let meeting
                for (let i in meetings) {
                    meeting = meetings[i]
                    let [uErr, uRes] = await Isolated.singleStartTimeUpdate(meeting)
                    if (uErr) {
                        errFlag = true;
                        console.log(`update start time of item (${i}: ${meeting}) from array error: `, uErr);
                        continue;
                    }
                }
                if (errFlag) return cb("ONE_UPDATE_ERROR_AT_LEAST")
                return cb(null, true)
            } else {
                console.log("wrong var type", meetings);
                return cb(true)
            }
        })()
    }

    Isolated.remoteMethod('updateMyStartTime', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
            { arg: 'meetings', type: 'any' },
        ],
        returns: { arg: 'res', type: 'boolean', root: true }
    });


    Isolated.checkMeetingToUpdate = (m) => {
        return m && typeof m === "object" && !Array.isArray(m)
            && m.meetingId
            && m.isPublicMeeting !== null && m.isPublicMeeting !== undefined
            && m.startTime
    }

    Isolated.singleStartTimeUpdate = async (meeting) => {
        let updateQ = generateUpdateQ(meeting.meetingId, meeting.isPublicMeeting, meeting.startTime)
        if (!updateQ) return [null]
        return await new Promise((resolve, reject) => {
            Isolated.dataSource.connector.query(updateQ, (err, res) => {
                if (err || !res) resolve([err])
                else resolve([null, res])
            })
        })

    }

    const generateUpdateQ = (meetingId, isPublicMeeting, newStartTime) => {
        if (!meetingId || isNaN(Number(meetingId)) || (typeof isPublicMeeting !== "boolean" && isPublicMeeting != 0 && isPublicMeeting != 1) || !newStartTime) return null;
        let formattedStartTime = new Date(newStartTime).toJSON().split("T").join(" ").split(/\.\d{3}\Z/).join("")
        return `UPDATE ${isPublicMeeting ? "shofar_blower_pub" : "isolated"} 
        SET ${isPublicMeeting ? "start_time" : "meeting_time"} = "${formattedStartTime}"
                    WHERE id = ${meetingId}`
    }






    //admin 
    Isolated.getIsolatedsForAdmin = function (limit, filter, cb) {
        (async () => {
            try {
                let where = ''
                if (filter.address && filter.address.length > 0) {
                    where += `WHERE MATCH(cu.address) AGAINST ('${filter.address}') `
                }
                if (filter.name && filter.name.length > 0) {
                    where += `${where.length > 0 ? ' AND' : 'WHERE'} MATCH(cu.name) AGAINST ('${filter.name}')`
                }
                if (filter.haveMeeting === true) {
                    where += `${where.length > 0 ? ' AND' : 'WHERE'} (isolated.public_meeting = 0 AND isolated.blowerMeetingId IS NOT NULL) OR
                    (isolated.public_meeting = 1 AND sbp.blowerId IS NOT NULL)`
                }
                else if (filter.haveMeeting === false) {
                    where += `${where.length > 0 ? ' AND' : 'WHERE'} (isolated.public_meeting = 0 AND isolated.blowerMeetingId IS NULL) OR
                    (isolated.public_meeting = 1 AND sbp.blowerId IS NULL)`
                }


                const isolatedQ = `SELECT isolated.id, cu.name, isolated.public_phone, cu.username, cu.address 
                FROM isolated 
                    LEFT JOIN CustomUser cu ON isolated.userIsolatedId = cu.id
                    LEFT JOIN shofar_blower_pub sbp ON isolated.blowerMeetingId = sbp.id  
                ${where}
                ORDER BY cu.name
                LIMIT 0, 20`

                const countQ = `SELECT COUNT(*) as resNum
                FROM isolated 
                LEFT JOIN CustomUser cu ON isolated.userIsolatedId = cu.id
                LEFT JOIN shofar_blower_pub sbp ON isolated.blowerMeetingId = sbp.id  
                ${where}`

                let [isolatedErr, isolatedRes] = await executeMySqlQuery(Isolated, isolatedQ);
                if (isolatedErr || !isolatedRes) {
                    console.log('get isolated admin request error : ', isolatedErr);
                    throw isolatedErr
                }
                let [countErr, countRes] = await executeMySqlQuery(Isolated, countQ);
                if (countErr || !countRes) {
                    console.log('get isolated admin request error : ', countErr);
                    throw countErr
                }

                isolatedRes = isolatedRes.map(isolated => {
                    if (isolated.public_phone === 1) isolated.phone = isolated.username
                    delete isolated.username
                    delete isolated.public_phone
                    return isolated
                })
                return cb(null, { isolateds: isolatedRes, resNum: countRes[0].resNum })
            }
            catch (err) {
                cb(err);
            }
        })()
    }

    Isolated.remoteMethod('getIsolatedsForAdmin', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'limit', type: 'object' },
            { arg: 'filter', type: 'object' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });


    Isolated.deleteIsolatedAdmin = function (id, cb) {
        (async () => {
            try {
                let isolatedInfo = await Isolated.findById(id, { fields: { public_meeting: true, blowerMeetingId: true, userIsolatedId: true } });
                if (isolatedInfo.public_meeting) {
                    //check the user's public meeting and see if there are other isolated registered in the meeting
                    //go to public meetings and check if the meeting has people in it or blower
                    if (isolatedInfo.blowerMeetingId) {
                        let participantsNum = await Isolated.count({ and: [{ 'blowerMeetingId': isolatedInfo.blowerMeetingId }, { public_meeting: 1 }] });
                        if (participantsNum <= 1) {
                            // if not delete the meeting
                            await Isolated.app.models.shofarBlowerPub.destroyById(isolatedInfo.blowerMeetingId);
                        }
                    }
                }
                //delete user info
                await Isolated.destroyById(id);

                await Isolated.app.models.CustomUser.destroyById(isolatedInfo.userIsolatedId);

                return cb(null, 'SUCCESS');

            } catch (error) {
                console.log(error);
                return cb(error);
            }
        })()
    }

    Isolated.remoteMethod('deleteIsolatedAdmin', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'id', type: 'number', require: true },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });




    Isolated.getNumberOfIsolatedWithoutMeeting = function (cb) {
        (async () => {
            //get all public meetings
            let [err, res] = await executeMySqlQuery(Isolated,
                `SELECT COUNT(*) as resNum
                FROM isolated
                WHERE isolated.blowerMeetingId IS NULL;`);
            if (err) cb(err);
            if (res) {
                return cb(null, res);
            }
        })()
    }

    Isolated.remoteMethod('getNumberOfIsolatedWithoutMeeting', {
        http: { verb: 'POST' },
        accepts: [],
        returns: { arg: 'res', type: 'object', root: true }
    });


    Isolated.getNumberOfMeetings = function (cb) {
        (async () => {
            let [err, res] = await executeMySqlQuery(Isolated.app.models.shofarBlowerPub,
                `SELECT  (	
                    (
                    SELECT COUNT(*) as resNum
                    FROM shofar_blower_pub
                    LEFT JOIN CustomUser blowerUser ON blowerUser.id = shofar_blower_pub.blowerId
                    LEFT JOIN shofar_blower ON blowerUser.id = shofar_blower.userBlowerId 
                    WHERE blowerId IS NOT NULL AND shofar_blower.confirm = 1
                    )+(
                    SELECT COUNT(*)                     
                    FROM isolated
                    WHERE 
                    isolated.blowerMeetingId IS NOT NULL
                    AND isolated.public_meeting = 0
                    )
                    ) 
                    AS resNum;`);
            if (err) cb(err);
            if (res) {
                return cb(null, res[0].resNum);
            }
        })()
    }

    Isolated.remoteMethod('getNumberOfMeetings', {
        http: { verb: 'POST' },
        accepts: [],
        returns: { arg: 'res', type: 'number', root: true }
    });

    Isolated.getParticipantsMeeting = function (id, cb) {
        (async () => {
            let [err, res] = await executeMySqlQuery(Isolated,
                `
                SELECT
                    isolatedUser.name AS "name",
                    isolatedUser.username AS "phone",
                    isolatedUser.id AS "id",
                    isolated.id AS "idIsolated",
                    RoleMapping.roleId AS "role" 
                FROM isolated
                    LEFT JOIN CustomUser isolatedUser ON isolatedUser.id = isolated.userIsolatedId
                    LEFT join RoleMapping on RoleMapping.principalId= isolatedUser.id
                    WHERE blowerMeetingId = ${id};     
            `
            );
            if (err) cb(err);
            if (res) {
                return cb(null, res);
            }
        })()
    }

    Isolated.remoteMethod('getParticipantsMeeting', {
        http: { verb: 'POST' },
        accepts: [{ arg: 'id', type: 'number', require: true }],
        returns: { arg: 'res', type: 'object', root: true }
    });

    Isolated.deleteConectionToMeeting = function (id, cb) {
        (async () => {
            let [err, res] = await to(Isolated.upsertWithWhere({ id}, { blowerMeetingId: null, meeting_time: null }));
            if (err) cb(err);
            if (res) {
                return cb(null, res);
            }
        })()
    }

    Isolated.remoteMethod('deleteConectionToMeeting', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'id', type: 'number' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
}
