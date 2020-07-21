'use strict';

module.exports = function (Isolated) {
    //role = 1
    // {
    //     "userIsolatedId" : 4,
    //         "public_phone": 0,
    //             "public_meeting" : 1,
    //                 "city" : "חיפה",
    //                     "street": "פרויד",
    //                         "appartment": "23",
    //                             "comments": null
    // }
    Isolated.InsertDataIsolated = async (data, options) => {
        let city;
        try {
            //check if the city is exist in city table
            city = await Isolated.app.models.City.findOne({ where: { "name": data.city } });
            //the city doesnt exist-> create the city
            if (!city.id) {
                try {
                    city = await Isolated.app.models.City.addNewCity(data.city, options);
                }
                catch (err) {
                    throw err;
                }
            }
        } catch (error) {

            throw error;
        }


        let objToIsolated = {
            "userIsolatedId": options.accessToken.userId,
            "public_phone": data.public_phone,
            "public_meeting": data.public_meeting
        },
            objToCU = {
                "cityId": city.id,
                "street": data.street,
                "appartment": data.appartment,
                "comments": data.comments
            };

        try {

            let resRole = await Isolated.app.models.RoleMapping.findOne({ where: { principalId: options.accessToken.userId } });

            if (resRole.roleId === 1) {

                let resIsolated = await Isolated.create(objToIsolated);
                let resCU = await Isolated.app.models.CustomUser.updateAll({ id: options.accessToken.userId }, objToCU);
                return { ok: true };
            } else {
                return { ok: false, err: "No permissions" };
            }

        } catch (error) {
            console.log("Can`t do create new isolated", error);
            throw error;

        }
    }


    Isolated.joinPublicMeeting = async (meetingInfo, options) => {
        if (options.accessToken && options.accessToken.userId) {
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
        else return;
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
