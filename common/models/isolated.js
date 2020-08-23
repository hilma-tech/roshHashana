'use strict';
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
        console.log('updateMyStartTime here');
        if (!options || !options.accessToken || !options.accessToken.userId) {
            console.log("NO_USER_ID_IN_OPTIONS in updateMyStartTime, meetings are:", meetings);
            return
        }
        (async () => {
            console.log(`meeting to update: ${meetings}`);
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
                    where += `${where.length > 0 ? 'AND' : 'WHERE'} MATCH(cu.name) AGAINST ('${filter.name}')`
                }

                const isolatedQ = `SELECT cu.name, isolated.public_phone, cu.username, cu.address 
                FROM isolated 
                    LEFT JOIN CustomUser cu ON isolated.userIsolatedId = cu.id
                ${where}
                ORDER BY cu.name
                LIMIT 0, 20`

                const countQ = `SELECT COUNT(*) as resNum
                FROM isolated 
                    LEFT JOIN CustomUser cu ON isolated.userIsolatedId = cu.id
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
                console.log('countRes:', countRes)


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


}
