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
        let objToIsolated = {
            "userIsolatedId": options.accessToken.userId,
            "public_phone": data.public_phone,
            "public_meeting": data.public_meeting
        },
            objToCU = {
                "city": data.city,
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


    Isolated.remoteMethod('InsertDataIsolated', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });



}
