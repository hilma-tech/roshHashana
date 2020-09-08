'use strict';
const to = require('../../server/common/to');
const executeMySqlQuery = async (Model, query) => await to(new Promise((resolve, reject) => { Model.dataSource.connector.query(query, (err, res) => { if (err) { reject(err); return; } resolve(res); }); }));
const CONSTS = require('../../server/common/consts/consts');
const checkDateBlock = require('../../server/common/checkDateBlock');

module.exports = function (shofarBlowerPub) {

    //data -> [{
    //     "address": 
    //     "comments":"ליד הבית ספר",
    //     "start_time": 2020-07-19 08:05:47,
    //     "blowerId": 4
    // },]

    //this function excepts to get data as an array!!!!
    shofarBlowerPub.createNewPubMeeting = async (data, blowerId, options, areConstMeetings = false) => {
        if (!Array.isArray(data)) { console.log("cannot get data in createNewPubMeeting cos not an array. data:", data); return; }
        let meetingDataArray = []
        if (options.accessToken && options.accessToken.userId) {
            for (let i = 0; i < data.length; i++) {
                let meetingData = data[i];

                let city;
                let addressArr = meetingData.address && meetingData.address[0]
                if (typeof addressArr === "string" && addressArr.length) {
                    addressArr = addressArr.split(", ")
                    city = shofarBlowerPub.app.models.CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1) || addressArr[addressArr.length - 1];
                }


                meetingData.address[0] = meetingData.address[0].substring(0, 398)

                let newPubMeeting = {
                    "address": meetingData.address[0],
                    "lng": meetingData.address[1].lng,
                    "lat": meetingData.address[1].lat,
                    city,
                    "constMeeting": areConstMeetings,
                    "comments": (meetingData.placeDescription && meetingData.placeDescription.length < 255) ? meetingData.placeDescription : (meetingData.comments && meetingData.comments.length < 255) ? meetingData.comments : '',
                    "start_time": meetingData.time,
                    "blowerId": blowerId
                }
                meetingDataArray.push(newPubMeeting)
            }
            try {
                //create new public meeting
                let res = await shofarBlowerPub.create(meetingDataArray);
                if (res) return Array.isArray(res) && res.length ? res[0].id : res.id;

            } catch (error) {
                throw error;
            }
        }
    }

    shofarBlowerPub.checkIfCanDeleteMeeting = async (meetingId) => {
        //count all the users that are registered to this meeting
        let numOfRegistered = await shofarBlowerPub.app.models.Isolated.find({ where: { and: [{ public_meeting: 1 }, { blowerMeetingId: meetingId }] } });
        console.log(numOfRegistered, 'numOfRegistered')
        if (numOfRegistered.length <= 1) {
            let pubMeet = await shofarBlowerPub.findOne({ where: { and: [{ id: meetingId }, { blowerId: { "neq": null } }, { constMeeting: 1 }] } });
            //this is the shofar blower's meeting
            if (pubMeet) return false;
            else return true;
        }
        else return false;
    }

    shofarBlowerPub.getPublicMeetings = function (startRow, filter, cb) {
        (async () => {
            let where = 'WHERE blowerId IS NOT NULL AND shofar_blower.confirm = 1'
            let orderBy = ''
            if (filter.address && filter.address.length > 0) {
                where += ` AND shofar_blower_pub.address REGEXP '${filter.address}'`
                orderBy += `ORDER BY CASE WHEN shofar_blower_pub.address LIKE '${filter.address}%' THEN 0 ELSE 1 END`
            }
            if (filter.name && filter.name.length > 0) {
                where += ` AND blowerUser.name REGEXP '${filter.name}'`
                orderBy += `${orderBy.length > 0 ? ',' : 'ORDER BY'} CASE WHEN blowerUser.name LIKE '${filter.name}%' THEN 0 ELSE 1 END`
            }

            //get all public meetings
            let [errPublic, resPublic] = await executeMySqlQuery(shofarBlowerPub,
                `SELECT
                    blowerUser.name AS "blowerName",
                    blowerUser.username AS "phone",
                    shofar_blower_pub.id,
                    shofar_blower_pub.address,
                    shofar_blower_pub.comments,
                    shofar_blower_pub.start_time,
                    (SELECT COUNT(*) FROM isolated WHERE blowerMeetingId = shofar_blower_pub.id) AS participantsNum
                FROM shofar_blower_pub
                    LEFT JOIN CustomUser blowerUser ON blowerUser.id = shofar_blower_pub.blowerId
                    LEFT JOIN shofar_blower ON blowerUser.id = shofar_blower.userBlowerId
                ${where}
                ${orderBy}
                LIMIT ${startRow}, 7`); //confirm change

            if (errPublic) cb(errPublic);

            if (resPublic) {
                let [err, res] = await executeMySqlQuery(shofarBlowerPub,
                    `SELECT COUNT(*) as resNum
                    FROM shofar_blower_pub
                    LEFT JOIN CustomUser blowerUser ON blowerUser.id = shofar_blower_pub.blowerId
                    LEFT JOIN shofar_blower ON blowerUser.id = shofar_blower.userBlowerId 
                    ${where}`
                );
                if (err) cb(err);
                if (res) {
                    return cb(null,
                        {
                            publicMeetings: resPublic,
                            num: res[0].resNum
                        });
                }
            }
        })()
    }

    shofarBlowerPub.remoteMethod('getPublicMeetings', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'startRow', type: 'number' },
            { arg: 'filter', type: 'object' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    shofarBlowerPub.deletePublicMeeting = function (meetingId, cb) {
        (async () => {
            let [err, res] = await to(shofarBlowerPub.destroyById(meetingId));
            if (err) cb(err);
            if (res) {
                return cb(null, res);
            }
        })()
    }

    shofarBlowerPub.remoteMethod('deletePublicMeeting', {
        http: { verb: 'POST' },
        accepts: [
            { arg: 'meetingId', type: 'number' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    shofarBlowerPub.getAllPublicMeetingPeople = function (meetingId, cb) {
        (async () => {
            let [err, res] = await to(shofarBlowerPub.app.models.Isolated.find({ where: { and: [{ public_meeting: 1 }, { blowerMeetingId: meetingId }] } }));
            if (err) cb(err);
            if (res) {
                return cb(null, res);
            }
        })()
    }

    shofarBlowerPub.remoteMethod('getAllPublicMeetingPeople', {
        http: { verb: 'GET' },
        accepts: [
            { arg: 'meetingId', type: 'number' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
}

