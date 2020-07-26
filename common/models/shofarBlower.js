'use strict';

module.exports = function (ShofarBlower) {
    //role = 2

    // {
    // "can_blow_x_times":1,
    //             "volunteering_start_time":1594563291554,
    //             "volunteering_max_time":1594563291554,
    //         "city" : "חיפה",
    //         "street": "פרויד",
    //         "appartment": "23",
    //         "comments": null
    //     }
    ShofarBlower.InsertDataShofarBlower = async (data, options) => {
        let city;
        try {
            //check if the city is exist in city table
            city = await ShofarBlower.app.models.City.findOne({ where: { "name": data.city } });
            //the city doesnt exist-> create the city
            if (!city || !city.id) {
                try {
                    city = await ShofarBlower.app.models.City.addNewCity(data.city, options);
                }
                catch (err) {
                    throw err;
                }
            }
        } catch (error) {
            throw error;
        }

        console.log('data', new Date(data.volunteering_start_time), new Date(data.volunteering_max_time))
        let objToBlower = {
            "userBlowerId": options.accessToken.userId,
            "can_blow_x_times": data.can_blow_x_times,
            "volunteering_start_time": data.volunteering_start_time,
            "volunteering_max_time": data.volunteering_max_time
        },
            objToCU = {
                "cityId": city.id,
                "street": data.street,
                "appartment": data.appartment,
                "comments": null
            };


        try {
            let resRole = await ShofarBlower.app.models.RoleMapping.findOne({ where: { principalId: options.accessToken.userId } });
            if (resRole.roleId === 2) {
                let resBlower = await ShofarBlower.create(objToBlower)
                let resCU = await ShofarBlower.app.models.CustomUser.updateAll({ id: options.accessToken.userId }, objToCU);
                //if the shofar blower added publicPlaces,
                if (data.publicPlaces) {
                    let resPublicMeetings = await ShofarBlower.app.models.shofarBlowerPub.createNewPubMeeting(data.publicPlaces, options.accessToken.userId, options);
                }
                return { ok: true };
            } else {
                return { ok: false, err: "No permissions" };
            }


        } catch (error) {
            console.log("Can`t do create new isolated", error);
            throw error;
        }

    }




    ShofarBlower.remoteMethod('InsertDataShofarBlower', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: "optionsFromRequest" }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });


}