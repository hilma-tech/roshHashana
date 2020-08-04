'use strict';

module.exports = function (Isolated) {
    const ISOLATED_ROLE = 1

    Isolated.InsertDataIsolated = async (data, options) => {
        if (options.accessToken && options.accessToken.userId) {
            try {
                let isolatedInfo = await Isolated.findOne({ where: { "userIsolatedId": options.accessToken.userId } });
                if (!isolatedInfo) {
                    let pubMeetId = null;
                    if (!data.address || !data.address.length) { console.log("ADDRESS NOT VALID"); return { ok: false, err: "כתובת אינה תקינה" } }
                    if (data.address === "NOT_A_VALID_ADDRESS" || (typeof address === "boolean" && address === true)) { console.log("ADDRESS NOT VALID"); return { ok: false, err: 'נא לבחור מיקום מהרשימה הנפתחת' } }
                    data.address = data.address.substring(0, 398) // shouldn't be more than 400 

                    //create public meeting
                    if (data.public_meeting) {
                        let meetData = [{
                            "address": data.address,
                            "comments": data.comments,
                            "start_time": null
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
                            "address": data.address,
                            "comments": data.comments
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


    Isolated.joinPublicMeeting = async (meetingInfo, options) => {
        if (!options.accessToken || !options.accessToken.userId) {
            return
        }
        console.log('options.accessToken', options.accessToken)
        console.log(meetingInfo, 'meetingInfo')
        let meetInfo = {
            "public_meeting": 1,
            "meeting_time": meetingInfo.start_time,
            "blowerMeetingId": meetingInfo.id
        }
        console.log(meetInfo, 'meetInfo')
        try {
            let res = await Isolated.upsertWithWhere({ userIsolatedId: options.accessToken.userId }, meetInfo);
            return { status: 'OK' };
        } catch (error) {
            console.log(error, 'er')
            return { status: 'FAILED' };
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

    Isolated.remoteMethod('joinPublicMeeting', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'meetingInfo', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

}
