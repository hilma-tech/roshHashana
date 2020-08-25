'use strict';
var logUser = require('debug')('model:user');
const moment = require('moment');
const randomstring = require("randomstring");

let sendMsg = require('../../server/sendSms/SendSms.js');
const CONSTS = require('../../server/common/consts/consts');
const checkDateBlock = require('../../server/common/checkDateBlock');
const to = require('../../server/common/to');
const { default: Axios } = require('axios');
const executeMySqlQuery = async (Model, query) => await to(new Promise((resolve, reject) => { Model.dataSource.connector.query(query, (err, res) => { if (err) { reject(err); return; } resolve(res); }); }));

let msgText = `שלום`
let msgText2 = `הקוד שלך הוא:`


module.exports = function (CustomUser) {

    const SHOFAR_BLOWER_ROLE = 2

    CustomUser.createUser = async (name, phone, role) => {
        //creates key and/or created user (with no data)
        //this function is called on Register's submit and on 'שלח קוד מחדש'
        let resKey = await CustomUser.app.models.keys.createKey();
        console.log(resKey);
        try {
            let ResFindUser = await CustomUser.findOne({ where: { username: phone } })

            if (!ResFindUser && role) {
                //sign up
                if ((role == 1 && checkDateBlock('DATE_TO_BLOCK_ISOLATED')) || (role == 2 && checkDateBlock('DATE_TO_BLOCK_BLOWER'))) {
                    //need to block the function
                    return CONSTS.CURRENTLY_BLOCKED_ERR;
                }
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
                console.log('RoleMapping.create: ', roleMapping);
                let ResRole = await CustomUser.app.models.RoleMapping.create(roleMapping);
                if (process.env.REACT_APP_IS_PRODUCTION === "true") {
                    sendMsg.sendMsg(phone, `${msgText} ${name}, ${msgText2} ${resKey.key}`)
                }
                return ResCustom;
            } else {
                //sign in
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

    CustomUser.authenticationKey = (key, meetingId, role, options, res, cb) => {
        const { RoleMapping } = CustomUser.app.models;
        CustomUser.app.models.keys.findOne({ where: { key } }, (err1, resKey) => {
            if (err1) {
                console.log("err", err1)
                cb(err1, null);
            }
            if (!resKey) {
                console.log("err key", resKey)
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
                            CustomUser.findOne({ where: { keyId: resKey.id } }, (err3, resUser) => {
                                if (err3) return cb(err3, null);
                                if (resUser) {
                                    RoleMapping.findOne({ where: { principalId: resUser.id } }, (err4, resRole) => {
                                        if (err4) console.log("Err4", err4);
                                        if (resRole) {
                                            if (resRole.roleId != 3 && resRole.roleId != role && !resUser.address) {
                                                console.log(`RoleMapping.updateAll: where { principalId: resUser.id(=${resUser.id}) } , { roleId: role(=${role}) }`);
                                                RoleMapping.updateAll({ principalId: resUser.id }, { roleId: role }, (err5, resNewRole) => {
                                                    if (err5) console.log("Err5", err5);
                                                    if (resNewRole) {
                                                        CustomUser.cookieAndAccessToken(resUser.id, meetingId, role, options, res, cb)
                                                    }
                                                })
                                            } else CustomUser.cookieAndAccessToken(resUser.id, meetingId, resRole.roleId, options, res, cb)
                                        }

                                    })
                                }
                            })
                        }
                    })
                } else {
                    cb(null, { ok: "time out" })
                }
            }
        })
    }

    CustomUser.cookieAndAccessToken = (userId, meetingId, roleId, options, res, cb) => {
        CustomUser.directLoginAs(userId, roleId, (err, result) => {
            let expires = new Date(Date.now() + 5184000000);
            res.cookie('access_token', result.__data.id, { signed: true, expires });
            res.cookie('klo', result.__data.klo, { signed: false, expires });
            res.cookie('kl', result.__data.kl, { signed: false, expires });
            // //These are all 'trash' cookies in order to confuse the hacker who tries to penetrate kl,klo cookies
            res.cookie('kloo', randomstring.generate(), { signed: true, expires });
            res.cookie('klk', randomstring.generate(), { signed: true, expires });
            res.cookie('olk', randomstring.generate(), { signed: true, expires });
            CustomUser.checkStatus(userId, meetingId, roleId, cb)
            // cb(null, { ok: true })
        },
            options, 5184000)
    }
    CustomUser.checkStatus = (userId, meetingId, roleId, cb) => {
        const { shofarBlowerPub } = CustomUser.app.models;
        CustomUser.findOne({ where: { id: userId } }, (err, res) => {
            if (err || !res) { console.log("Err", err); } //todo: return cb(true?)
            if (res) {
                switch (roleId) {
                    case 1:
                        if (res.address == null) {
                            if (checkDateBlock('DATE_TO_BLOCK_ISOLATED')) {
                                //need to block the function
                                return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
                            }
                            cb(null, { ok: "isolator new", data: { name: res.name } })
                        } else {
                            cb(null, { ok: "isolator with data", data: { name: res.name, address: res.address, comments: res.comments } })
                        }
                        break;

                    case 2:
                        if (res.address == null) {
                            if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
                                //need to block the function
                                return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
                            }
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
                                        include: ["blowerPublic"]
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
                                                        meetingInfo: {
                                                            address: resPublicMeeting.address,
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
        // map data for all maps (except for shofar blower map)

        //get all private meetings  
        let [errPrivate, resPrivate] = await executeMySqlQuery(CustomUser,
            `SELECT 
                isolatedUser.name AS "isolatedName", 
                isolatedUser.address,
                isolatedUser.lat,
                isolatedUser.lng,
                isolatedUser.comments,
                blowerUser.name AS "blowerName",
                isolated.id AS "meetingId" 
            FROM isolated 
                LEFT JOIN CustomUser isolatedUser ON isolatedUser.id = isolated.userIsolatedId 
                LEFT JOIN CustomUser blowerUser ON blowerUser.id =isolated.blowerMeetingId
                LEFT JOIN shofar_blower ON blowerUser.id = shofar_blower.userBlowerId 
            WHERE isolated.public_meeting = 0 and isolated.blowerMeetingId IS NOT NULL AND shofar_blower.confirm = 1`); //confirm change
        if (errPrivate) throw errPrivate;
        //get all public meetings
        if (resPrivate) {
            let [errPublic, resPublic] = await executeMySqlQuery(CustomUser,
                `SELECT
                    blowerUser.name AS "blowerName",
                    shofar_blower_pub.id AS "meetingId",
                    shofar_blower_pub.address,
                    shofar_blower_pub.lat,
                    shofar_blower_pub.lng,
                    shofar_blower_pub.comments,
                    shofar_blower_pub.start_time
                FROM shofar_blower_pub
                    LEFT JOIN CustomUser blowerUser ON blowerUser.id = shofar_blower_pub.blowerId
                    LEFT JOIN shofar_blower ON blowerUser.id = shofar_blower.userBlowerId 
                WHERE blowerId IS NOT NULL AND shofar_blower.confirm = 1;`); //confirm change
            if (errPublic) throw errPublic;

            if (resPublic) {
                let userAddress;
                //get user address if it is not public map
                if (!isPubMap) {

                    let [err, address] = await executeMySqlQuery(CustomUser,
                        `SELECT CustomUser.address, CustomUser.lat, CustomUser.lng, CustomUser.comments FROM CustomUser WHERE CustomUser.id = ${options.accessToken.userId};`)
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
        if (!options.accessToken || !options.accessToken.userId) {
            throw true
        }
        try {
            const userId = options.accessToken.userId;
            let role = await getUserRole(userId);
            if (!role) return;

            let userInfo = {};
            //get the user info from customuser -> user address and phone number
            userInfo = await CustomUser.findOne({ where: { id: userId }, fields: { username: true, name: true, address: true, comments: true, lng: true, lat: true } });
            if (role === 1) {
                //isolated
                let isolated = await CustomUser.app.models.Isolated.findOne({ where: { userIsolatedId: userId }, fields: { public_phone: true, meeting_time: true, public_meeting: true, blowerMeetingId: true } });
                if (!isolated) return { errMsg: 'LOG_OUT' };
                userInfo.public_meeting = isolated.public_meeting;
                userInfo.public_phone = isolated.public_phone;
                userInfo.meeting_time = isolated.meeting_time;
                if (isolated.blowerMeetingId) {
                    if (!isolated.public_meeting) { // isoalted with private meeting
                        let blowerName = await CustomUser.findOne({ where: { id: isolated.blowerMeetingId }, fields: { name: true } });
                        userInfo.blowerName = blowerName.name;
                    }
                    else { // isolated with public meeting
                        let meetingInfo = await CustomUser.app.models.shofarBlowerPub.findOne({ where: { id: isolated.blowerMeetingId }, include: ["blowerPublic"] });
                        if (meetingInfo) {
                            userInfo.meeting_time = meetingInfo.start_time ? meetingInfo.start_time : null;
                            userInfo.address = meetingInfo.address ? meetingInfo.address : null;
                            userInfo.blowerName = (meetingInfo.blowerPublic && meetingInfo.blowerPublic()) ? meetingInfo.blowerPublic().name : null;
                        }
                    }
                }
                userInfo.blowerMeetingId = isolated.blowerMeetingId;
                return userInfo;
            }
            else if (role === 2) {
                //shofar blower 
                let blower = await CustomUser.app.models.ShofarBlower.findOne({ where: { userBlowerId: userId } });
                if (!blower) return { errMsg: 'LOG_OUT' };
                userInfo.can_blow_x_times = blower.can_blow_x_times;
                userInfo.volunteering_start_time = blower.volunteering_start_time;
                userInfo.volunteering_max_time = blower.volunteering_max_time;

                let publicMeetings = await CustomUser.app.models.shofarBlowerPub.find({ where: { blowerId: userId } });
                userInfo.publicMeetings = [];
                let pm;
                if (Array.isArray(publicMeetings))
                    for (let i in [...publicMeetings]) {
                        pm = [...publicMeetings][i] && [...publicMeetings][i].__data || [...publicMeetings][i]
                        userInfo.publicMeetings.push({ ...pm, address: [pm.address, { lng: pm.lng, lat: pm.lat }] });
                    }
                return userInfo;
            }
            else {
                //general user
                const genUserQ = ` SELECT
                        shofar_blower_pub.address,
                        shofar_blower_pub.comments,
                        shofar_blower_pub.start_time,
                        CustomUser.name AS blowerName
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


    CustomUser.getLastItemThatIsNotIsrael = (arr, pos) => {
        //gets an array of strings and the last position of that array (arr.length - 1)
        // returns the first item (from the end) that is not ירושלים
        //? check if pos is bigger than 1000000 ? (to prevent an infinite loop cos goes from pos to pos===0 (on pos===0 returns))
        if (arr[pos] !== "ישראל") {
            return arr[pos]
        }
        if (!pos || pos == 300) {
            return arr[arr.length - 1]
        }
        return CustomUser.getLastItemThatIsNotIsrael(arr, pos - 1)
    }

    CustomUser.updateUserInfo = async (data, options) => {
        const { shofarBlowerPub, Isolated, ShofarBlower } = CustomUser.app.models;
        if (!options.accessToken || !options.accessToken.userId) {
            throw true
        }
        const userId = options.accessToken.userId;
        let role = await getUserRole(userId);
        if (!role) return;
        if (((role == 1 || role == 3) && checkDateBlock('DATE_TO_BLOCK_ISOLATED')) || role == 2 && checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
            //block the function
            return CONSTS.CURRENTLY_BLOCKED_ERR;
        }
        try {
            let userData = {}
            if (data.name) userData.name = data.name
            if (data.username) userData.username = data.username
            if (data.address && data.address[1] && data.address[1].lng) userData.lng = data.address[1].lng
            if (data.address && data.address[1] && data.address[1].lat) userData.lat = data.address[1].lat
            if (data.comments && data.comments.length < 255) userData.comments = data.comments
            else userData.comments = '';

            if (data.address && data.address[0]) {
                userData.address = data.address[0]
                let addressArr = data.address[0]
                if (typeof addressArr === "string" && addressArr.length) {
                    addressArr = addressArr.split(", ")
                    let city = CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1);
                    userData.city = city || addressArr[addressArr.length - 1];
                }
            }

            if (Object.keys(userData).length) {
                let resCustomUser = await CustomUser.upsertWithWhere({ id: userId }, userData);
            }
            if (role === 1) {
                //isolated
                let pubMeetId = null;
                let isolatedInfo = await Isolated.findOne({ where: { userIsolatedId: userId }, include: [{ UserToIsolated: true }] });

                //if the user changed his address and he has a public meeting
                if ((data.public_meeting || isolatedInfo.public_meeting) && data.address) {
                    let meetingId = isolatedInfo.blowerMeetingId;
                    let canEditPubMeeting = await shofarBlowerPub.checkIfCanDeleteMeeting(meetingId);
                    //we can update the meeting so update the address of the meeting
                    if (canEditPubMeeting) pubMeetId = await shofarBlowerPub.upsertWithWhere({ id: meetingId }, { address: data.address[0], lat: data.address[1].lat, lng: data.address[1].lng });
                    //we can not update the meeting so create a new meeting with the new address
                    else {
                        let meetData = {}
                        if (data.address) meetData.address = data.address
                        if (data.comments && data.comments.length < 255) meetData.comments = data.comments
                        else meetData.comments = '';
                        if (data.start_time) meetData.start_time = data.start_time

                        if (Object.keys(meetData).length) {
                            pubMeetId = await shofarBlowerPub.createNewPubMeeting([meetData], null, options);
                        }
                    }
                }

                else if (data.public_meeting && isolatedInfo && !isolatedInfo.public_meeting) {
                    let meetData = {}
                    if (data.address) meetData.address = data.address;
                    else {
                        const address = [isolatedInfo.UserToIsolated().address, { lat: isolatedInfo.UserToIsolated().lat, lng: isolatedInfo.UserToIsolated().lng }];
                        meetData.address = address;
                    }
                    if (data.comments && data.comments.length < 255) meetData.comments = data.comments;
                    else meetData.comments = isolatedInfo.UserToIsolated().comments;
                    if (data.start_time) meetData.start_time = data.start_time;

                    if (Object.keys(meetData).length) {
                        pubMeetId = await shofarBlowerPub.createNewPubMeeting([meetData], null, options);
                    }
                }
                else {

                    //the user is changing from public to private
                    if (isolatedInfo) {
                        let meetingId = isolatedInfo.blowerMeetingId;
                        let canDeleteMeeting = await shofarBlowerPub.checkIfCanDeleteMeeting(meetingId);
                        if (canDeleteMeeting) await shofarBlowerPub.destroyById(meetingId);
                    }
                }

                let newIsoData = {
                    userIsolatedId: userId,
                    public_phone: data.public_phone,
                    public_meeting: data.public_meeting,
                    blowerMeetingId: (pubMeetId && typeof pubMeetId === 'object') ? pubMeetId.id : pubMeetId
                }
                if (Object.values(newIsoData).find(d => d)) {
                    let resIsolated = await Isolated.upsertWithWhere({ userIsolatedId: userId }, newIsoData);
                }


            }
            else if (role === 2) {
                //shofar blower

                let newBloData = {}
                if (data.volunteering_max_time) newBloData.volunteering_max_time = data.volunteering_max_time
                if (data.can_blow_x_times) newBloData.can_blow_x_times = data.can_blow_x_times
                if (data.volunteering_start_time) newBloData.volunteering_start_time = data.volunteering_start_time
                if (Object.values(newBloData).length) {
                    let resBlower = await ShofarBlower.upsertWithWhere({ userBlowerId: userId }, newBloData);
                }
                if (data.publicMeetings && Array.isArray(data.publicMeetings)) {
                    // update also all the public meetings
                    const [errDeletePublicMeetings, resDeletePublicMeetings] = await to(shofarBlowerPub.destroyAll({ blowerId: userId }))
                    if (errDeletePublicMeetings) {
                        console.log("errDeletePublicMeetings", errDeletePublicMeetings)
                    }
                    else console.log("successfully deleted all public meetings (in order to create)");

                    let publicMeetingsArr = data.publicMeetings.filter(publicMeeting => publicMeeting.address && Array.isArray(publicMeeting.address) && publicMeeting.address[0] && publicMeeting.address[1] && typeof publicMeeting.address[1] === "object" && (publicMeeting.time || publicMeeting.start_time) && userId)

                    let city;
                    publicMeetingsArr = publicMeetingsArr.map(publicMeeting => {
                        if (publicMeeting.address && publicMeeting.address[0]) {
                            let addressArr = publicMeeting.address[0]
                            if (typeof addressArr === "string" && addressArr.length) {
                                addressArr = addressArr.split(", ")
                                city = CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1);
                            }
                        }
                        return {
                            address: publicMeeting.address && publicMeeting.address[0],
                            lng: publicMeeting.address && publicMeeting.address[1] && publicMeeting.address[1].lng,
                            lat: publicMeeting.address && publicMeeting.address[1] && publicMeeting.address[1].lat,
                            city,
                            constMeeting: true,
                            comments: publicMeeting.placeDescription || publicMeeting.comments,
                            start_time: publicMeeting.time || publicMeeting.start_time,
                            blowerId: userId
                        }
                    })
                    console.log("publicMeetingsArr to create", publicMeetingsArr)
                    const [errCreatePublicMeetings, resCreatePublicMeetings] = await to(shofarBlowerPub.create(publicMeetingsArr))
                    if (errDeletePublicMeetings) {
                        console.log("errCreatePublicMeetings", errCreatePublicMeetings)
                    } else console.log("successfully created the publicMeetings");
                }

            }
            else return; //general user

        } catch (error) {
            throw error;
        }
    }

    const getUserRole = async (userId) => {
        let userRole = await CustomUser.app.models.RoleMapping.findOne({ where: { "principalId": userId }, fields: { roleId: true } });
        if (!userRole) return null;
        else return userRole.roleId;
    }

    CustomUser.deleteUser = async (options) => {
        if (!options.accessToken || !options.accessToken.userId) {
            throw true
        }
        const userId = options.accessToken.userId;
        let role = await getUserRole(userId);
        if (!role) return;
        if (((role == 1 || role == 3) && checkDateBlock('DATE_TO_BLOCK_ISOLATED')) || (role == 2 && checkDateBlock('DATE_TO_BLOCK_BLOWER'))) {
            //block the function
            return CONSTS.CURRENTLY_BLOCKED_ERR;
        }
        try {

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

                await CustomUser.app.models.Isolated.updateAll({ and: [{ public_meeting: 0 }, { blowerMeetingId: userId }] }, { blowerMeetingId: null, meeting_time: null });
                await CustomUser.app.models.ShofarBlower.destroyAll({ "userBlowerId": userId });

            }
            else {
                //general user
                await CustomUser.app.models.Isolated.destroyAll({ "userIsolatedId": userId });
            }
            await CustomUser.app.models.RoleMapping.destroyAll({ principalId: userId });
            await CustomUser.destroyById(userId);
            return { res: 'SUCCESS' };

        } catch (error) {
            return { err: 'FAILED' };
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
            { arg: 'role', type: 'number' },
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

    CustomUser.mapInfoSB = function (options, cb) { // might make sense to move this to ShofarBlower.js BUT..
        (async () => {
            const allRes = {}
            if (!options || !options.accessToken || !options.accessToken.userId) {
                return cb(true);
            }
            const { userId } = options.accessToken

            const userDataQ = `SELECT 
                                shofar_blower.confirm, 
                                shofar_blower.can_blow_x_times, 
                                volunteering_start_time AS "startTime", 
                                volunteering_max_time*60000 AS "maxRouteDuration", 
                                CustomUser.name, 
                                CustomUser.address, 
                                CustomUser.lng,
                                CustomUser.lat 
                            FROM shofar_blower 
                                LEFT JOIN CustomUser ON CustomUser.id = shofar_blower.userBlowerId 
                            WHERE CustomUser.id = ${userId}`

            let [userDataErr, userData] = await executeMySqlQuery(CustomUser, userDataQ)
            if (userDataErr || !userData) console.log('userDataErr: ', userDataErr);
            if (!userData || !userData[0] || !userData[0].address) return cb(null, "NO_ADDRESS")
            allRes.userData = userDataErr || !userData ? true : userData
            if (!userData[0] || !userData[0].confirm) return cb(null, allRes)

            //open PRIVATE meeting requests
            const openPriReqsQ = /* request for private meetings */`SELECT 
            isolated.id AS "meetingId", 
            false AS "isPublicMeeting", 
            IF(isolated.public_phone, CustomUser.username, null) AS "phone", 
            CustomUser.name, 
            CustomUser.address,
            CustomUser.lng,
            CustomUser.lat 
            
            FROM isolated 
                JOIN CustomUser ON userIsolatedId  = CustomUser.id 
            
            WHERE public_meeting = 0 AND blowerMeetingId IS NULL`;

            const allPubsQ = /* open PUBLIC meeting requests and MY PUbLIC routes */ `
            SELECT 
            shofar_blower_pub.id AS "meetingId", 
            shofar_blower_pub.constMeeting, 
            start_time AS "startTime", 
            shofar_blower_pub.address, 
            shofar_blower_pub.comments, 
            shofar_blower_pub.lng, 
            shofar_blower_pub.lat,
            true AS "isPublicRoute", 
            COUNT(isolated.id) AS "signedCount",  
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
            const priRouteMeetsQ = `
            SELECT 
                isolated.id AS "meetingId", 
                isolated.meeting_time AS "startTime", 
                CustomUser.address,
                CustomUser.lng,
                CustomUser.lat,
                CustomUser.comments, 
                CustomUser.name,
                IF(isolated.public_phone, CustomUser.username, null) AS "phone", 
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

    CustomUser.assignSB = function (options, meetingObj, cb) {

        console.log('assignSB: ');
        (async () => {
            if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
                //block the function
                return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
            }
            if (!meetingObj || typeof (meetingObj) !== "object" || Array.isArray(meetingObj)) return cb(true)

            if (!options || !options.accessToken || !options.accessToken.userId) return cb(true)

            const { userId } = options.accessToken;

            //check if user is confirmed by admin (and get userData for route calc later on)
            const userDataQ =
                `SELECT 
                shofar_blower.confirm, 
                shofar_blower.can_blow_x_times, 
                volunteering_start_time AS "startTime", 
                volunteering_max_time*60000 AS "maxRouteDuration", 
                CustomUser.name, 
                CustomUser.address, 
                CustomUser.lng,
                CustomUser.lat 
            FROM shofar_blower 
                LEFT JOIN CustomUser ON CustomUser.id = shofar_blower.userBlowerId 
            WHERE CustomUser.id = ${userId}`

            let [userDataErr, userDataRes] = await executeMySqlQuery(CustomUser, userDataQ)
            if (userDataErr || !userDataRes) { console.log('userDataErr: ', userDataErr); return cb(true) }
            if (!userDataRes[0] || !userDataRes[0].confirm) return cb(true)
            let userData = userDataRes[0]

            //! check that number of meetings in not at max
            // then
            //! get and check newTotalTime
            //! get and return assignStartTime
            //my PRIVATE routes
            const priRouteMeetsQ =
                `SELECT 
                isolated.id AS "meetingId", 
                isolated.meeting_time AS "startTime", 
                CustomUser.address,
                CustomUser.lng,
                CustomUser.lat,
                CustomUser.comments, 
                CustomUser.name, 
                IF(isolated.public_meeting = 1, true, false) AS "isPublicMeeting" 
            FROM isolated 
                LEFT JOIN CustomUser ON CustomUser.id = isolated.userIsolatedId 
            WHERE public_meeting = 0 AND blowerMeetingId = ${userId}`
            const allPubsQ = /* open PUBLIC meeting requests and MY PUbLIC routes */
                `SELECT 
                                shofar_blower_pub.id AS "meetingId", 
                                shofar_blower_pub.constMeeting, 
                                start_time AS "startTime", 
                                shofar_blower_pub.address, 
                                shofar_blower_pub.comments, 
                                shofar_blower_pub.lng, 
                                shofar_blower_pub.lat,
                                true AS "isPublicRoute", 
                                COUNT(isolated.id) AS "signedCount", 
                                CASE
                                    WHEN blowerId IS NULL THEN "req"
                                    WHEN blowerId = ${userId} THEN "route"
                                END blowerStatus,
                                true AS isPublicMeeting 
                            FROM isolated 
                                RIGHT JOIN shofar_blower_pub ON shofar_blower_pub.id = isolated.blowerMeetingId 
                            WHERE (blowerId IS NULL OR blowerId = ${userId}) 
                            GROUP BY shofar_blower_pub.id ORDER BY start_time`

            const [priRouteErr, priRouteRes] = await executeMySqlQuery(CustomUser, priRouteMeetsQ)
            if (priRouteErr || !priRouteRes) { console.log('private route error : ', priRouteErr); return cb(true) }
            const [pubsErr, pubsRes] = await executeMySqlQuery(CustomUser, allPubsQ)
            if (pubsErr || !pubsRes) { console.log('public route and request error : ', pubsErr); return cb(true) }
            const myPubRoutes = []
            const pubReqs = []
            let r
            for (let i in pubsRes) {
                r = pubsRes[i]
                if (r.blowerStatus === "req") {
                    pubReqs.push(r)
                } else if (r.blowerStatus === "route") myPubRoutes.push(r)
            }
            const myMeetings = [...myPubRoutes, ...priRouteRes]
            // seperate const meetings from my route
            const userStartTime = new Date(userData.startTime).getTime()
            const userEndTime = userStartTime + userData.maxRouteDuration;
            const myRoute = [];
            let meetingStartTime;
            //fill myRoute (without const meetings)
            for (let i in myMeetings) {
                meetingStartTime = new Date(myMeetings[i].startTime).getTime()
                if (!myMeetings[i].constMeeting || (meetingStartTime > userStartTime && meetingStartTime < userEndTime)) {
                    myRoute.push(myMeetings[i])
                }
            }

            //! check route length
            console.log(`checking route length ${myRoute.length}, ${userData.can_blow_x_times} and that is not >= to 20`);
            if (userData.can_blow_x_times == myRoute.length) {
                return cb(null, { errName: "MAX_ROUTE_LENGTH", errData: { currRouteLength: userData.can_blow_x_times } })
            }
            if (myRoute.length == 20) {
                return cb(null, { errName: "MAX_ROUTE_LENGTH_20", errData: { currRouteLength: userData.can_blow_x_times } })
            }

            const origin = `${userData.lat},${userData.lng}`

            const stops = (Array.isArray(myRoute) && myRoute.length) ? [...myRoute, meetingObj] : [meetingObj]
            let waypoints;
            try { waypoints = stops.map(s => (`${s.lat},${s.lng}`)) } catch (e) { waypoints = [] }
            let destination;
            try { destination = waypoints.pop() } catch (e) { destination = {}; return cb(true) }

            let url = ""
            let result
            try {
                url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&waypoints=${waypoints.join("|")}&destination=${destination}&key=${process.env.REACT_APP_GOOGLE_KEY_SECOND}&mode=walking&language=iw`
                let res = await Axios.get(url);
                result = res.data
                result.startTimes = []
                let leg;
                let prevStartTimeVal
                let legDuration
                for (let i in stops) {
                    leg = result.routes[0].legs[i]
                    legDuration = Number(leg.duration.value) * 1000
                    if (!result.startTimes[i - 1]) {
                        if (!userData || !new Date(userData.startTime).getTime) continue;
                        prevStartTimeVal = new Date(userData.startTime).getTime()
                    } else {
                        prevStartTimeVal = result.startTimes[i - 1].startTime + CONSTS.SHOFAR_BLOWING_DURATION_MS
                    }
                    result.startTimes.push({ duration: leg.duration, distance: leg.distance, meetingId: stops[i].meetingId, isPublicMeeting: stops[i].isPublicMeeting, startTime: Number(prevStartTimeVal) + legDuration })
                }
            }
            catch (e) {
                console.log('google maps request for directions, in assign: err, ', e)
                return cb(true)
            }
            const totalTimeReducer = (accumulator, s) => (s && s.duration ? (accumulator + (Number(s.duration.value) || 1) + (CONSTS.SHOFAR_BLOWING_DURATION_MS / 1000)) : null)
            const newTotalTime = result.startTimes.reduce(totalTimeReducer, 0) * 1000 //mins to ms

            let assignStartTime;
            try {
                assignStartTime = result.startTimes[result.startTimes.length - 1].startTime
            } catch (e) { console.log("start time from result err ", e); }

            const newAssignMeetingObj = { ...meetingObj, startTime: assignStartTime } //will b returned to client

            //! check max total time length
            console.log(`checking max duration ${userData.maxRouteDuration} ${newTotalTime}`);
            if (userData && userData.maxRouteDuration && newTotalTime && newTotalTime > userData.maxRouteDuration) {
                return cb(null, { errName: "MAX_DURATION", errData: { newTotalTime: newTotalTime, maxRouteDuration: userData.maxRouteDuration, newAssignMeetingObj: newAssignMeetingObj } })
            }

            let formattedStartTime;
            if (!new Date(newAssignMeetingObj.startTime).getTime) return cb(true);
            if (!newAssignMeetingObj.meetingId) return cb(true)
            try {
                formattedStartTime = new Date(newAssignMeetingObj.startTime).toJSON().split("T").join(" ").split(/\.\d{3}\Z/).join("")
            } catch (e) { console.log("assign: wrong time: ", newAssignMeetingObj.startTime, " ", e); return cb(true) }
            const blowerUpdateQ = newAssignMeetingObj.isPublicMeeting ?
                `UPDATE shofar_blower_pub SET blowerId = ${userId}, start_time = "${formattedStartTime}" WHERE id = ${newAssignMeetingObj.meetingId} AND blowerId IS NULL`
                : `UPDATE isolated SET blowerMeetingId = ${userId}, meeting_time = "${formattedStartTime}" WHERE id = ${newAssignMeetingObj.meetingId} AND blowerMeetingId IS NULL`
            let [assignErr, assignRes] = await executeMySqlQuery(CustomUser, blowerUpdateQ)
            if (assignErr || !assignRes) {
                console.log('assign update err: ', assignErr);
                return cb(true)
            }
            // find phone number of isolater
            console.log(meetingObj);
            console.log('assignRes: ', assignRes);
            const findIsolatedQ = `select name, username from isolated left join CustomUser on CustomUser.id = isolated.userIsolatedId where public_meeting = ${meetingObj.isPublicMeeting ? 1 : 0} and isolated.${meetingObj.isPublicMeeting ? "blowerMeetingId" : "id"} = ${meetingObj.meetingId}`
            console.log('findIsolatedQ: ', findIsolatedQ);

            return cb(null, newAssignMeetingObj) //success, return new meeting obj, to add to myMeetings on client-side SBCtx
        })();
    }

    CustomUser.remoteMethod('assignSB', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }, { arg: "meetingObj", type: "object" }
        ],
        returns: { arg: 'res', type: 'any', root: true }
    })

    CustomUser.updateMaxDurationAndAssign = function (options, meetingObj, newMaxTimeVal, cb) {
        console.log('update max duration and assign: ', newMaxTimeVal, meetingObj);
        (async () => {
            if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
                //block the function
                return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
            }
            if (!meetingObj || Array.isArray(meetingObj) || typeof meetingObj !== "object") return cb(true)
            if (!options || !options.accessToken || !options.accessToken.userId) return cb(true)

            const { userId } = options.accessToken;
            if (isNaN(Number(options.accessToken.userId)) || userId < 1) return cb(true)

            if (!newMaxTimeVal) return cb(true)
            let newMaxTimeMins;
            try {
                newMaxTimeMins = Number(newMaxTimeVal) / 60000
            } catch (_e) { return cb(true) }
            if (!newMaxTimeMins || isNaN(newMaxTimeMins) || newMaxTimeMins > 180) return cb(true)

            //! update volunteering_max_time
            const [durationUpdateErr, durationUpdateRes] = await executeMySqlQuery(CustomUser, `UPDATE shofar_blower SET volunteering_max_time=${newMaxTimeMins < 15 ? 15 : Math.ceil(newMaxTimeMins)} WHERE userBlowerId = ${userId}`)
            if (durationUpdateErr || !durationUpdateRes) {
                console.log(`durationUpdateErr, ${durationUpdateErr}`);
                return cb(true)
            }
            console.log('update volunteering_max_time, newMaxTimeMins: ', newMaxTimeMins);


            // call assignSB
            CustomUser.assignSB(options, meetingObj, (assignE, assignR) => {
                return cb(assignE, assignR)
            })

        })();
    }
    CustomUser.remoteMethod('updateMaxDurationAndAssign', {
        http: { verb: 'post' },
        accepts: [{ arg: 'options', type: 'object', http: 'optionsFromRequest' }, { arg: "meetingObj", type: "object" }, { arg: "newMaxTimeVal", type: "any" }],
        returns: { arg: 'res', type: 'boolean', root: true }
    })

    CustomUser.updateMaxRouteLengthAndAssign = function (options, meetingObj, cb) {
        console.log('update route length and assign: ');
        (async () => {
            if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
                //block the function
                return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
            }
            if (!meetingObj || Array.isArray(meetingObj) || typeof meetingObj !== "object") return cb(true)
            if (!options || !options.accessToken || !options.accessToken.userId) return cb(true)

            const { userId } = options.accessToken;
            if (isNaN(Number(options.accessToken.userId)) || userId < 1) return cb(true)

            //! update can_blow_x_times
            const [lengthUpdateErr, lengthUpdateRes] = await executeMySqlQuery(CustomUser, `UPDATE shofar_blower SET can_blow_x_times = shofar_blower.can_blow_x_times+1 WHERE userBlowerId = ${userId}`)
            if (lengthUpdateErr || !lengthUpdateRes) {
                console.log(`lengthUpdateErr, ${lengthUpdateErr}`);
                return cb(true)
            }

            // call assignSB
            CustomUser.assignSB(options, meetingObj, (assignE, assignR) => {
                return cb(assignE, assignR)
            })

        })();
    }
    CustomUser.remoteMethod('updateMaxRouteLengthAndAssign', {
        http: { verb: 'post' },
        accepts: [{ arg: 'options', type: 'object', http: 'optionsFromRequest' }, { arg: "meetingObj", type: "object" }],
        returns: { arg: 'res', type: 'boolean', root: true }
    })


    const sqlForScripts = () => {
        const sbQ = `select name, username from CustomUser left join RoleMapping on CustomUser.id = RoleMapping.principalId where roleId = ${SHOFAR_BLOWER_ROLE}`

        const publicMeetings = `select isolated.id meetingId, public_meeting isPublicMeeting , pub_meetings.start_time meetingTime , pub_meetings.address, blower.name from isolated left join shofar_blower_pub pub_meetings on pub_meetings.id = blowerMeetingId left join CustomUser blower on blower.id = pub_meetings.blowerId where public_meeting = 1`

        const privateMeetings = `select isolated.id meetingId, public_meeting isPublicMeeting , meeting_time meetingTime , blower.name blowerName from isolated left join CustomUser blower on blower.id = blowerMeetingId where public_meeting = 0`

    }

};

