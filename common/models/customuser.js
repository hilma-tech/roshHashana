'use strict';
var logUser = require('debug')('model:user');
let sendMsg = require('../../server/sendSms/SendSms.js')
const moment = require('moment');
const randomstring = require("randomstring");
const to = require('../../server/common/to');
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
                // sendMsg.sendMsg(phone,`${msgText} ${name}, ${msgText2} ${resKey.key}`)
                return ResCustom;



            } else {
                if (ResFindUser && ResFindUser.keyId) {
                    let ResDeleteKey = await CustomUser.app.models.keys.destroyById(ResFindUser.keyId);
                }

                let ResUpdateUser = await CustomUser.updateAll({ username: phone }, { keyId: resKey.id });
                // sendMsg.sendMsg(phone,`${msgText} ${name}, ${msgText2} ${resKey.key}`)
                return ResUpdateUser;


            }
        } catch (error) {
            if (error) { console.log("error creating new shofar...."); throw error }
        }
    }

    CustomUser.authenticationKey = (key, options, res, cb) => {
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
                //TODO לבדוק אם צריך לזהות שהקוד הגיע מאותו מקום שרשם את הטלפון הזה 
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
                                    console.log("Login secess")
                                    CustomUser.directLoginAs(resUser.id, resUser.role, (err, result) => {
                                        let expires = new Date(Date.now() + 5184000000);
                                        res.cookie('access_token', result.__data.id, { signed: true, expires });
                                        res.cookie('klo', result.__data.klo, { signed: false, expires });
                                        res.cookie('kl', result.__data.kl, { signed: false, expires });
                                        // //These are all 'trash' cookies in order to confuse the hacker who tries to penetrate kl,klo cookies
                                        res.cookie('kloo', randomstring.generate(), { signed: true, expires });
                                        res.cookie('klk', randomstring.generate(), { signed: true, expires });
                                        res.cookie('olk', randomstring.generate(), { signed: true, expires });
                                        CustomUser.checkStatus(result.userId, cb)
                                        // cb(null, { ok: true })
                                    },
                                        options, 5184000)
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
    CustomUser.checkStatus = (userId, cb) => {
        let status
        CustomUser.app.models.RoleMapping.findOne({ where: { principalId: userId } }, (err, resRole) => {
            if (err) {
                console.log("Err", err);
            }
            if (resRole) {
                status = resRole.roleId
                CustomUser.findOne({ where: { id: userId } }, (err, res) => {
                    if (err) {
                        console.log("Err", err);
                    }
                    if (res) {
                        console.log(res, 'res');

                        if (res.cityId == null && status === 2) {
                            cb(null, { ok: "blower new", data: { name: res.name } })
                        } else
                            if ((res.cityId != null && status === 2)) {
                                cb(null, { ok: "blower with data", data: { name: res.name } })
                            } else
                                if (res.cityId == null && status === 1) {
                                    cb(null, { ok: "isolator new", data: { name: res.name } })
                                } else
                                    if (res.cityId != null && status === 1) {
                                        CustomUser.app.models.city.findOne({ where: { id: res.cityId } }, (errCity, city) => {
                                            if (errCity) console.log('errCity', errCity);
                                            if (city) {
                                                let address = res.street + ' ' + res.appartment + ' ' + res.comments + ', ' + city.name;
                                                cb(null, { ok: "isolator with data", data: { name: res.name, address } })
                                            }
                                        });
                                    } else
                                        if (status == 3) {
                                            cb(null, { ok: "isolated with public meeting" })
                                            //TODO להוסיף הרשמה של מבודד לפגישה ציבורית
                                        } else cb(null, { ok: "problem" })
                    }
                })
            }
        })

    }

    CustomUser.getMapData = async (isPubMap = false, options) => {

        //get all private meetings
        let [errPrivate, resPrivate] = await executeMySqlQuery(CustomUser, `select isolatedUser.name AS "isolatedName", city.name AS "cityMeeting", isolatedUser.street "streetMeeting", isolatedUser.appartment, isolatedUser.comments, blowerUser.name AS "blowerName" FROM isolated left join CustomUser isolatedUser on isolatedUser.id = isolated.userIsolatedId left join city on isolatedUser.cityId = city.id left join CustomUser blowerUser on blowerUser.id =isolated.blowerMeetingId where isolated.public_meeting = 0 and isolated.blowerMeetingId is not null `);
        if (errPrivate) throw errPrivate;
        //get all public meetings
        if (resPrivate) {
            let [errPublic, resPublic] = await executeMySqlQuery(CustomUser, `select blowerUser.name AS "blowerName", city.name AS "city", shofar_blower_pub.id, shofar_blower_pub.street, shofar_blower_pub.comments , shofar_blower_pub.start_time from shofar_blower_pub LEFT JOIN CustomUser blowerUser on blowerUser.id = shofar_blower_pub.blowerId LEFT JOIN city on city.id = shofar_blower_pub.cityId where blowerId is not null;`);
            if (errPublic) throw errPublic;

            if (resPublic) {
                let userAddress;
                //get user address if it is not public map
                if (!isPubMap) {
                    let [err, address] = await executeMySqlQuery(CustomUser, `select city.name, CustomUser.street, CustomUser.appartment from CustomUser left join city on CustomUser.cityId = city.id where CustomUser.id = ${options.accessToken.userId};`)
                    if (err) throw err;
                    if (address) userAddress = address;
                }
                return { userAddress, privateMeetings: resPrivate, publicMeetings: resPublic };
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


    CustomUser.openSBRequests = function (options, cb) {
        (async () => {
            const openReqs = `select CustomUser.name AS "isolatedName", isolated.public_phone, isolated.public_meeting, shofar_blower_pub.cityId AS "public city id" from isolated left join shofar_blower_pub on shofar_blower_pub.id = isolated.blowerMeetingId left join CustomUser on CustomUser.id = isolated.userIsolatedId where blowerMeetingId is null or ( isolated.public_meeting = 1 and (select blowerId from shofar_blower_pub where shofar_blower_pub.id = isolated.blowerMeetingId) is null )`
            let [err, res] = await executeMySqlQuery(CustomUser, openReqs);
            if (err || !res) return cb(true)
            return cb(res)
        })();
    }
    CustomUser.remoteMethod('openSBRequests', {
        http: { verb: 'get' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'string', root: true }
    });

};