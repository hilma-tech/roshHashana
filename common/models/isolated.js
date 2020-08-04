'use strict';

module.exports = function (Isolated) {
    const ISOLATED_ROLE = 1

    Isolated.InsertDataIsolated = async (data, options) => {
        console.log('data: ', data);
        if (options.accessToken && options.accessToken.userId) {
            try {
                let isolatedInfo = await Isolated.findOne({ where: { "userIsolatedId": options.accessToken.userId } });
                if (!isolatedInfo) {
                    let pubMeetId = null;
                    if (!Array.isArray(data.address) || data.address.length !== 2) { console.log("ADDRESS NOT VALID"); return { ok: false, err: "כתובת אינה תקינה" } }
                    if (!data.address[0] || data.address[0] === "NOT_A_VALID_ADDRESS" || typeof data.address[1] !== "object" || !data.address[1].lng || !data.address[1].lat) { console.log("ADDRESS NOT VALID"); return { ok: false, err: 'נא לבחור מיקום מהרשימה הנפתחת' } }
                    data.address[0] = data.address[0].substring(0, 398) // shouldn't be more than 400 

                    //create public meeting
                    if (data.public_meeting) {
                        let meetData = [{
                            "address": data.address[0],
                            "lng": data.address[1].lng,
                            "lat": data.address[1].lat,
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
                            "address": data.address[0],
                            "lng": data.address[1].lng,
                            "lat": data.address[1].lat,
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


    Isolated.remoteMethod('InsertDataIsolated', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

}
