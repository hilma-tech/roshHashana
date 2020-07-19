'use strict';

module.exports = function (shofarBlowerPub) {

    //data -> [{
    //     "city": "ירושלים",
    //     "street": "גדעון",
    //     "comments":"ליד הבית ספר",
    //     "start_time": 2020-07-19 08:05:47,
    //     "blowerId": 4
    // },]

    shofarBlowerPub.createNewPubMeeting = async (data, blowerId, options) => {
        for (let i = 0; i < data.length; i++) {
            let meetingData = data[i];
            if (options.accessToken && options.accessToken.userId) {
                console.log(meetingData)

                //find the city or create one
                let city;
                try {
                    //check if the city is exist in city table
                    city = await shofarBlowerPub.app.models.City.findOne({ where: { "name": meetingData.city } });
                    //the city doesnt exist-> create the city
                    if (!city.id) {
                        try {
                            city = await shofarBlowerPub.app.models.City.addNewCity(meetingData.city, options);
                        }
                        catch (err) {
                            throw err;
                        }
                    }
                } catch (error) {
                    throw error;
                }

                let newPubMeeting = {
                    "cityId": city.id,
                    "street": meetingData.street,
                    "comments": meetingData.placeDescription,
                    "start_time": meetingData.time,
                    "blowerId": blowerId
                }

                try {
                    //create new public meeting
                    let res = await shofarBlowerPub.create(newPubMeeting);
                    console.log(res, 'res');
                    if (res) return res.id;

                } catch (error) {
                    throw error;
                }
            }
        }
    }

    shofarBlowerPub.remoteMethod('createNewPubMeeting', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
}

