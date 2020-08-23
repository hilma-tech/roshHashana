'use strict';
const to = require('../../server/common/to');
const CONSTS = require('../../server/common/consts/consts');
const checkDateBlock = require('../../server/common/checkDateBlock');

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
        if (options.accessToken && options.accessToken.userId) {
            try {
                const { userId } = options.accessToken;
                const { meetingId } = meetToDelete;
                if (meetToDelete.isPublicMeeting) {
                    let participantsNum = await ShofarBlower.app.models.Isolated.count({ and: [{ 'blowerMeetingId': meetingId }, { public_meeting: 1 }] });
                    if (participantsNum && participantsNum > 0) { //there are  participants in this meeting
                        //only delete the connection between the blower and the meeting
                        await ShofarBlower.app.models.shofarBlowerPub.upsertWithWhere({ id: meetingId }, { blowerId: null, constMeeting: 0, start_time: null });
                    }
                    else await ShofarBlower.app.models.shofarBlowerPub.destroyById(meetingId); //there are no participants in this meeting, delete this meeting
                }
                else {
                    //private meeting -> change blowerMeetingId to null -> 
                    //only delete the connection between the blower and the meeting
                    await ShofarBlower.app.models.Isolated.upsertWithWhere({ and: [{ blowerMeetingId: userId }, { public_meeting: 0 }, { id: meetingId }] }, { blowerMeetingId: null, meeting_time: null });
                }
                return true;
            } catch (error) {
                throw error;
                //return false
            }
        }
        else return false;
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
}