'use strict';
var logUser = require('debug')('model:user');
let sendMsg = require('../../server/sendSms/SendSms.js')
const moment = require('moment');
const randomstring = require("randomstring");
const to = require('../../server/common/to');
const { options } = require('superagent');
let msgText = `שלום`
let msgText2 = `הקוד שלך הוא:`

const executeMySqlQuery = async (Model, query) => await to(new Promise((resolve, reject) => { Model.dataSource.connector.query(query, (err, res) => { if (err) { reject(err); return; } resolve(res); }); }));

module.exports = function (CustomUser) {


    CustomUser.createUser = async (name, phone, role) => {
        let resKey = await CustomUser.app.models.keys.createKey();
        console.log(resKey);
        try {
            let ResFindUser = await CustomUser.findOne({ where: { username: phone } })

            if (!ResFindUser) {

                let user = {
                    name: name,
                    username: phone,
                    keyId: resKey.id,
                };

                let ResCustom = await CustomUser.create(user);

                let roleMapping = {
                    "principalType": "User",
                    "principalId": ResCustom.id,
                    "roleId": role
                }
                let ResRole = await CustomUser.app.models.RoleMapping.create(roleMapping);
                if (process.env.REACT_APP_IS_PRODUCTION === "true") {
                    sendMsg.sendMsg(phone, `${msgText} ${name}, ${msgText2} ${resKey.key}`)
                }
                return ResCustom;



            } else {
                if (ResFindUser && ResFindUser.keyId) {
                    let ResDeleteKey = await CustomUser.app.models.keys.destroyById(ResFindUser.keyId);
                }

                let ResUpdateUser = await CustomUser.updateAll({ username: phone }, { keyId: resKey.id });
                if (process.env.REACT_APP_IS_PRODUCTION === "true") {
                    sendMsg.sendMsg(phone, `${msgText} ${name}, ${msgText2} ${resKey.key}`)
                }

                return ResUpdateUser;


            }
        } catch (error) {
            if (error) { console.log("error creating new shofar...."); throw error }
        }
    }

    CustomUser.authenticationKey = (key, meetingId, options, res, cb) => {
        CustomUser.app.models.keys.findOne({ where: { key } }, (err1, resKey) => {
            if (err1) {
                console.log("err", err1)
                cb(err1, null);
            }
            if (!resKey) {
                console.log(resKey)
                console.log("err key")
                cb(null, { ok: "err key" })
            } else {
                const newTime = moment(new Date())
                const endTime = moment(resKey.date_key).add(10, 'm');
                if (newTime.isBefore(endTime)) {
                    CustomUser.app.models.keys.destroyById(resKey.id, (err2, resdelet) => {
                        if (err2) {
                            console.log("err", err2)
                            cb(err2, null)
                        }
                        if (resdelet) {
                            CustomUser.findOne({ where: { keyId: resKey.id } }, (err, resUser) => {
                                if (err) return cb(err, null);
                                if (resUser) {
                                    CustomUser.app.models.RoleMapping.findOne({ where: { principalId: resUser.id } }, (err, resRole) => {
                                        if (err) console.log("Err", err);
                                        if (resRole) {
                                            console.log("Login secess")
                                            CustomUser.directLoginAs(resUser.id, resRole.roleId, (err, result) => {
                                                let expires = new Date(Date.now() + 5184000000);
                                                res.cookie('access_token', result.__data.id, { signed: true, expires });
                                                res.cookie('klo', result.__data.klo, { signed: false, expires });
                                                res.cookie('kl', result.__data.kl, { signed: false, expires });
                                                // //These are all 'trash' cookies in order to confuse the hacker who tries to penetrate kl,klo cookies
                                                res.cookie('kloo', randomstring.generate(), { signed: true, expires });
                                                res.cookie('klk', randomstring.generate(), { signed: true, expires });
                                                res.cookie('olk', randomstring.generate(), { signed: true, expires });
                                                CustomUser.checkStatus(result.userId, meetingId, resRole, cb)
                                                // cb(null, { ok: true })
                                            },
                                                options, 5184000)
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else {
                    console.log("time out")
                    cb(null, { ok: "time out" })
                }
            }
        })
    }
    CustomUser.checkStatus = (userId, meetingId, resRole, cb) => {
        const { shofarBlowerPub } = CustomUser.app.models;
        let status = resRole.roleId
        CustomUser.findOne({ where: { id: userId } }, (err, res) => {
            if (err) console.log("Err", err);
            if (res) {
                switch (status) {
                    case 1:
                        if (res.address == null) {
                            cb(null, { ok: "isolator new", data: { name: res.name } })
                        } else {
                            // CustomUser.app.models.city.findOne({ where: { id: res.cityId } }, (errCity, city) => {
                            //     if (errCity) console.log('errCity', errCity);
                            //     if (city) {
                            //         let street = res.street ? res.street : '';
                            //         let appartment = res.appartment ? res.appartment : '';
                            //         let comments = res.comments ? res.comments : '';
                            //         let address = street + ' ' + appartment + ' ' + comments + ', ' + city.name;
                            cb(null, { ok: "isolator with data", data: { name: res.name, address: res.address } })
                            //     }
                            // });
                        }
                        break;

                    case 2:
                        if (res.address == null) {
                            cb(null, { ok: "blower new", data: { name: res.name } })
                        } else cb(null, { ok: "blower with data", data: { name: res.name } })
                        break;

                    case 3:
                        CustomUser.app.models.isolated.findOne({ where: { userIsolatedId: res.id } }, (errIsolated, resIsolated) => {
                            if (errIsolated) console.log("errIsolated", errIsolated);
                            if (!resIsolated && meetingId !== null) {
                                //isolated with new public meeting 
                                CustomUser.app.models.isolated.create({ userIsolatedId: res.id, public_meeting: 1, blowerMeetingId: meetingId, public_phone: 0 }, (errPM, resPM) => {
                                    if (errPM) console.log("errPM", errPM);
                                    if (resPM) {
                                        cb(null, { ok: "isolated with new public meeting", data: { name: res.name } })
                                    }
                                });
                            } else if (resIsolated && resIsolated.public_meeting == 1) {
                                if (meetingId == null) {
                                    shofarBlowerPub.findOne({
                                        where: { id: resIsolated.blowerMeetingId },
                                        include: ["blowerPublic", "meetingCity"]
                                    },
                                        (errPublicMeeting, resPublicMeeting) => {
                                            if (errPublicMeeting) console.log("errPublicMeeting", errPublicMeeting);
                                            if (resPublicMeeting) {
                                                //isolated with public meeting
                                                cb(null, {
                                                    ok: "isolated with public meeting",
                                                    data:
                                                    {
                                                        name: res.name,
                                                        // meetingInfo: {
                                                        //     street: resPublicMeeting.street,
                                                        //     comments: resPublicMeeting.comments,
                                                        //     start_time: resPublicMeeting.start_time,
                                                        //     city: resPublicMeeting.meetingCity().name,
                                                        //     blowerName: resPublicMeeting.blowerPublic().name
                                                        // }
                                                        meetingInfo: {
                                                            address: res.address,
                                                            comments: resPublicMeeting.comments,
                                                            start_time: resPublicMeeting.start_time,
                                                            blowerName: resPublicMeeting.blowerPublic().name
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                } else {
                                    //public meeting already exists
                                    cb(null, { ok: "public meeting already exists", data: { name: res.name } })

                                }
                            }
                        });

                        break;
                    default:
                        cb(null, { ok: "problem" })
                        break;
                }


            }
        })

    }



    CustomUser.getMapData = async (isPubMap = false, options) => {

        //get all private meetings
        let [errPrivate, resPrivate] = await executeMySqlQuery(CustomUser,
            `select 
            isolatedUser.name AS "isolatedName", 
            isolatedUser.address,
            isolatedUser.comments,
            blowerUser.name AS "blowerName"
            FROM 
            isolated 
            left join CustomUser isolatedUser on isolatedUser.id = isolated.userIsolatedId 
            left join CustomUser blowerUser on blowerUser.id =isolated.blowerMeetingId
            where 
            isolated.public_meeting = 0 and isolated.blowerMeetingId is not null `);
        if (errPrivate) throw errPrivate;
        //get all public meetings
        if (resPrivate) {
            let [errPublic, resPublic] = await executeMySqlQuery(CustomUser,
                `select
                blowerUser.name AS "blowerName",
                shofar_blower_pub.id,
                shofar_blower_pub.address,
                shofar_blower_pub.comments ,
                shofar_blower_pub.start_time
                from
                shofar_blower_pub
                LEFT JOIN CustomUser blowerUser on blowerUser.id = shofar_blower_pub.blowerId 
                where blowerId is not null;`);
            if (errPublic) throw errPublic;

            if (resPublic) {
                let userAddress;
                //get user address if it is not public map
                if (!isPubMap) {

                    let [err, address] = await executeMySqlQuery(CustomUser,
                        `select
                         CustomUser.address
                         from
                         CustomUser
                         where CustomUser.id = ${options.accessToken.userId};`)
                    if (err) throw err;
                    if (address) {
                        userAddress = address;
                    }
                }
                return { userAddress, privateMeetings: resPrivate, publicMeetings: resPublic };
            }
        }
    }

    //get the user info according to his role
    CustomUser.getUserInfo = async (options) => {
        if (options.accessToken && options.accessToken.userId) {
            try {
                const userId = options.accessToken.userId;
                let role = await getUserRole(userId);
                if (!role) return;

                let userInfo = {};
                //get the user info from customuser -> user address and phone number
                userInfo = await CustomUser.findOne({ where: { id: userId }, fields: { username: true, name: true, address: true, comments: true } });
                if (role === 1) {
                    //isolated
                    let isolated = await CustomUser.app.models.Isolated.findOne({ where: { userIsolatedId: userId }, fields: { public_phone: true, public_meeting: true } });
                    userInfo.public_meeting = isolated.public_meeting;
                    userInfo.public_phone = isolated.public_phone;
                    return userInfo;
                }
                else if (role === 2) {
                    //shofar blower 
                    let blower = await CustomUser.app.models.ShofarBlower.findOne({ where: { userBlowerId: userId } });
                    userInfo.can_blow_x_times = blower.can_blow_x_times;
                    userInfo.volunteering_start_time = blower.volunteering_start_time;
                    userInfo.volunteering_max_time = blower.volunteering_max_time;

                    let publicMeetings = await CustomUser.app.models.shofarBlowerPub.find({ where: { blowerId: userId } });
                    userInfo.publicMeetings = publicMeetings;
                    return userInfo;
                }
                else {
                    //general user
                    const genUserQ = ` SELECT
                        shofar_blower_pub.address,
                        shofar_blower_pub.comments,
                        shofar_blower_pub.start_time,
                        CustomUser.name AS blowerName,
                    FROM 
                        isolated
                        RIGHT JOIN shofar_blower_pub ON isolated.blowerMeetingId = shofar_blower_pub.id
                        INNER JOIN CustomUser  ON shofar_blower_pub.blowerId = CustomUser.id
                    WHERE
                        isolated.userIsolatedId = ${userId}`
                    let [errUserData, resUserData] = await executeMySqlQuery(CustomUser, genUserQ)
                    if (errUserData) {
                        console.log("errUserData", errUserData)
                    }
                    if (resUserData) {
                        userInfo.meetingInfo = {
                            address: resUserData[0].address,
                            comments: resUserData[0].comments,
                            start_time: resUserData[0].start_time,
                            blowerName: resUserData[0].blowerName
                        }
                        return userInfo; //general user
                    }
                }
            }
            catch (err) {
                throw err;
            }

        }
    }

    CustomUser.updateUserInfo = async (data, options) => {
        const { shofarBlowerPub } = CustomUser.app.models;
        if (options.accessToken && options.accessToken.userId) {
            try {
                const userId = options.accessToken.userId;
                let role = await getUserRole(userId);
                if (!role) return;
                let city;
                if (data.city) {
                    city = await CustomUser.app.models.city.findOne({ where: { name: data.city } });
                }
                let userData = {
                    name: data.name,
                    username: data.username,
                    street: data.street ? data.street : null,
                    appartment: data.appartment ? data.appartment : null,
                    comments: data.comments ? data.comments : null,
                    cityId: city ? city.id : null
                }
                let resCustomUser = await CustomUser.upsertWithWhere({ id: userId }, userData);
                if (role === 1) {
                    //isolated
                    let newIsoData = {
                        userIsolatedId: userId,
                        public_phone: data.public_phone,
                        public_meeting: data.public_meeting
                    }
                    let resIsolated = await CustomUser.app.models.Isolated.upsertWithWhere({ userIsolatedId: userId }, newIsoData);
                }
                else if (role === 2) {
                    //shofar blower
                    let newBloData = {
                        volunteering_max_time: data.volunteering_max_time,
                        can_blow_x_times: data.can_blow_x_times,
                        volunteering_start_time: data.volunteering_start_time
                    }
                    let resBlower = await CustomUser.app.models.ShofarBlower.upsertWithWhere({ userBlowerId: userId }, newBloData);
                    // update also all the public meetings
                    const [resDeletePublicMeetings, errDeletePublicMeetings] = await to(shofarBlowerPub.destroyAll({ blowerId: userId }))
                    if (errDeletePublicMeetings) {
                        console.log("errDeletePublicMeetings", errDeletePublicMeetings)
                    }
                    let publicMeetingsArr = data.publicMeetings.filter(publicMeeting => {
                        if (publicMeeting.cityId && publicMeeting.street && (publicMeeting.time || publicMeeting.start_time) && userId) {
                            return true; // skip
                        }
                        return false;
                    })

                    publicMeetingsArr = publicMeetingsArr.map(publicMeeting => {
                        return {
                            cityId: publicMeeting.cityId,
                            street: publicMeeting.street,
                            comments: publicMeeting.placeDescription || publicMeeting.comments,
                            start_time: publicMeeting.time || publicMeeting.start_time,
                            blowerId: userId
                        }
                    })
                    const [resCreatePublicMeetings, errCreatePublicMeetings] = await to(shofarBlowerPub.create(publicMeetingsArr))
                    if (errDeletePublicMeetings) {
                        console.log("errCreatePublicMeetings", errCreatePublicMeetings)
                    }

                }
                else return; //general user

            } catch (error) {
                throw error;
            }
        }
    }

    const getUserRole = async (userId) => {
        let userRole = await CustomUser.app.models.RoleMapping.findOne({ where: { "principalId": userId }, fields: { roleId: true } });
        if (!userRole) return null;
        else return userRole.roleId;
    }

    CustomUser.deleteUser = async (options) => {
        if (options.accessToken && options.accessToken.userId) {
            try {
                const userId = options.accessToken.userId;
                let role = await getUserRole(userId);
                if (!role) return;

                let userData = await CustomUser.findOne({ where: { id: userId }, fields: { name: true, username: true } });
                userData.userId = userId;
                //add deleted user to the archive
                CustomUser.app.models.usersArchive.addUserToArchive(userData);

                if (role === 1) {
                    //isolated
                    let isolatedInfo = await CustomUser.app.models.Isolated.findOne({ where: { userIsolatedId: userId }, fields: { public_meeting: true, blowerMeetingId: true } });
                    if (isolatedInfo.public_meeting) {
                        //check the user's public meeting and see if there are other isolated registered in the meeting
                        //go to public meetings and check if the meeting has people in it or blower
                        let participantsNum = await CustomUser.app.models.Isolated.count({ and: [{ 'blowerMeetingId': isolatedInfo.blowerMeetingId }, { public_meeting: 1 }] });
                        if (participantsNum <= 1) {
                            // if not delete the meeting
                            await CustomUser.app.models.shofarBlowerPub.destroyById(isolatedInfo.blowerMeetingId);

                        }
                    }
                    //delete user info
                    await CustomUser.app.models.Isolated.destroyAll({ 'userIsolatedId': userId });
                }
                else if (role === 2) {//shofar blower
                    //find all blower's public meetings
                    let [errPublicMeeting, resPublicMeeting] = await executeMySqlQuery(CustomUser,
                        `select count(isolated.id) as participantsNum , shofar_blower_pub.id as meetingId, blowerId as userId
                         from isolated right join shofar_blower_pub on  shofar_blower_pub.id = isolated.blowerMeetingId 
                         where (blowerId = 10) 
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
                        meetingsToUpdate.length > 0 && await CustomUser.app.models.shofarBlowerPub.updateAll({ id: { inq: meetingsToUpdate } }, { blowerId: null });
                        //delete the meeting
                        meetingsToDelete.length > 0 && await CustomUser.app.models.shofarBlowerPub.destroyAll({ id: { inq: meetingsToDelete } });
                    }

                    await CustomUser.app.models.Isolated.updateAll({ where: { and: [{ public_meeting: 0 }, { blowerMeetingId: userId }] } }, { blowerMeetingId: null, meeting_time: null });
                    //TODO: להודיע למבודדים שבוטלה להם הפגישה
                    await CustomUser.app.models.ShofarBlower.destroyAll({ "userBlowerId": userId });

                }
                else {
                    //general user
                    await CustomUser.app.models.Isolated.destroyAll({ "userIsolatedId": userId });
                }
                await CustomUser.destroyById(userId);
                return { res: 'SUCCESS' };

            } catch (error) {
                return { err: 'FAILED' };
            }

        }

    }


    CustomUser.remoteMethod('createUser', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'name', type: 'string' },
            { arg: 'phone', type: 'string' },
            { arg: 'role', type: 'number' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    CustomUser.remoteMethod('authenticationKey', {
        http: { verb: 'get' },
        accepts: [
            { arg: 'key', type: 'string' },
            { arg: 'meetingId', type: 'any' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
            { arg: 'res', type: 'object', http: { source: 'res' } }

        ],
        returns: { arg: 'res', type: 'string', root: true }
    });

    CustomUser.remoteMethod('getMapData', {
        http: { verb: 'get' },
        accepts: [
            { arg: 'isPubMap', type: 'boolean' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    CustomUser.remoteMethod('getUserInfo', {
        http: { verb: 'get' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    CustomUser.remoteMethod('updateUserInfo', {
        http: { verb: 'put' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    CustomUser.remoteMethod('deleteUser', {
        http: { verb: 'delete' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    CustomUser.mapInfoSB = function (options, cb) {
        (async () => {
            const allRes = {}
            if (!options || !options.accessToken || !options.accessToken.userId) {
                return cb(true);
            }
            const { userId } = options.accessToken
console.log("userId",userId)
            const userDataQ = 
            `SELECT 
            shofar_blower.confirm, 
            shofar_blower.can_blow_x_times, 
            volunteering_start_time AS "startTime",
             volunteering_max_time*60000 AS "maxRouteDuration", 
             CustomUser.name,CustomUser.address 
             FROM shofar_blower LEFT JOIN CustomUser ON CustomUser.id = shofar_blower.userBlowerId 
             WHERE CustomUser.id = ${userId}`
console.log(userDataQ)
            let [userDataErr, userData] = await executeMySqlQuery(CustomUser, userDataQ)
            if (userDataErr || !userData) console.log('userDataErr: ', userDataErr);
            console.log('userData: ', userData);
            if (!userData[0] || !userData[0].address) return cb(null, "NO_address")
            allRes.userData = userDataErr || !userData ? true : userData
            if (!userData[0] || !userData[0].confirm) return cb(null, allRes)
            //open PRIVATE meeting requests
            const openPriReqsQ = /* request for private meetings */
            `SELECT isolated.id AS "meetingId", false AS "isPublicMeeting", IF(isolated.public_phone, CustomUser.username, null) AS "phone", CustomUser.name, 
            CustomUser.address, CustomUser.comments 
            FROM isolated 
            JOIN CustomUser ON userIsolatedId  = CustomUser.id  
            WHERE public_meeting = 0 AND blowerMeetingId IS NULL`;
            /* 
            {startTime: "2020-07-20T07:15:27.000Z",
            city: 'צור הדסה',
            street: 'רכסים',
            isPublicRoute: 1,
            signedCount: 0,
            blowerStatus: 'req'}
            */
            const allPubsQ = /* open PUBLIC meeting requests and MY PUbLIC routes */ `
            SELECT shofar_blower_pub.id AS "meetingId", shofar_blower_pub.constMeeting, start_time AS "startTime", address, shofar_blower_pub.comments, true AS "isPublicRoute", COUNT(isolated.id) AS "signedCount",  
            CASE
                WHEN blowerId IS NULL THEN "req"
                WHEN blowerId = ${userId} THEN "route"
            END blowerStatus,
            true AS isPublicMeeting 
            FROM isolated 
                RIGHT JOIN shofar_blower_pub ON shofar_blower_pub.id = isolated.blowerMeetingId 
            WHERE (blowerId IS NULL OR blowerId = ${userId}) 
            GROUP BY shofar_blower_pub.id ORDER BY start_time`

            //my PRIVATE routes
            /* 
            {startTime: null,
            city: 'צור הדסה',
            street: 'רכסים',
            appartment: '20',
            name: 'עדי',
            isPublicMeeting: 1}
            */
            const priRouteMeetsQ = `
            SELECT 
                isolated.id AS "meetingId", 
                isolated.meeting_time AS "startTime", 
                CustomUser.address,
                CustomUser.name AS "name", 
                CustomUser.comments, 
                IF(isolated.public_meeting = 1, true, false) AS "isPublicMeeting" 
            FROM isolated 
                LEFT JOIN CustomUser ON CustomUser.id = isolated.userIsolatedId 
            WHERE public_meeting = 0 AND blowerMeetingId = ${userId}`

            let [priReqErr, priReqRes] = await executeMySqlQuery(CustomUser, openPriReqsQ);
            if (priReqErr || !priReqRes) { console.log('private request error : ', priReqErr); }
            const [priRouteErr, priRouteRes] = await executeMySqlQuery(CustomUser, priRouteMeetsQ)
            if (priRouteErr || !priRouteRes) { console.log('private route error : ', priRouteErr); }
            const [pubsErr, pubsRes] = await executeMySqlQuery(CustomUser, allPubsQ)
            if (pubsErr || !pubsRes) { console.log('public route and request error : ', pubsErr); }
            console.log('++ priReqRes: ', priReqRes);
            console.log('++ priRouteRes: ', priRouteRes);
            console.log('++ pubsRes: ', pubsRes);

            const myPubRoutes = []
            const pubReqs = []
            let r
            for (let i in pubsRes) {
                r = pubsRes[i]
                if (r.blowerStatus === "req") {
                    pubReqs.push(r)
                } else if (r.blowerStatus === "route") myPubRoutes.push(r)
            }
            allRes.myRoute = [...myPubRoutes, ...priRouteRes]
            allRes.openReqs = [...priReqRes, ...pubReqs]
            return cb(null, allRes)
        })();
    }
    CustomUser.remoteMethod('mapInfoSB', {
        http: { verb: 'get' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'string', root: true }
    });

    CustomUser.assignSB = function (options, meetingObjs, cb) {
        //check if user is confirmed by admin 
        (async () => {

            console.log('!assignSB!: meetingObjs:', meetingObjs);
            if (!meetingObjs || !Array.isArray(meetingObjs)) return cb(true)
            if (!options || !options.accessToken || !options.accessToken.userId) return cb(true)
            const { userId } = options.accessToken;
            // / meetingObj:
            // {
            //     isPublicMeeting: boolean,
            //     meetingId: num,
            //     startTime: date,
            // }
            let allRes = []
            let formattedStartTime;
            for (let meetingObj of meetingObjs) {
                if (!new Date(meetingObj.startTime).getTime) continue;
                try {
                    formattedStartTime = new Date(meetingObj.startTime).toJSON().split("T").join(" ").split(/\.\d{3}\Z/).join("")
                } catch (e) { console.log("wrong time: ", meetingObj.startTime, " ", e); return cb(true) }
                const blowerUpdateQ = meetingObj.isPublicMeeting ?
                    `UPDATE shofar_blower_pub SET blowerId = ${userId}, start_time = "${formattedStartTime}" WHERE id = ${meetingObj.meetingId} AND blowerId IS NULL`
                    : `UPDATE isolated SET blowerMeetingId = ${userId}, meeting_time = "${formattedStartTime}" WHERE id = ${meetingObj.meetingId} AND blowerMeetingId IS NULL`
                console.log('blowerUpdateQ: ', blowerUpdateQ);
                let [err, res] = await executeMySqlQuery(CustomUser, blowerUpdateQ)
                if (err || !res) console.log('err: ', err);
                allRes.push({ meetingId: meetingObj.meetingId, success: !err && !!res })
            }
            console.log('allRes: ', allRes);
            return cb(null, allRes)
        })();
    }

    CustomUser.remoteMethod('assignSB', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }, { arg: "meetingObjs", type: "array" }
        ],
        returns: { arg: 'res', type: 'string', root: true }
    })

};