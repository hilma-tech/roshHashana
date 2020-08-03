'use strict';

module.exports = function (shofarBlowerPub) {

    //data -> [{
    //     "city": "ירושלים", || cityId
    //     "street": "גדעון",
    //     "comments":"ליד הבית ספר",
    //     "start_time": 2020-07-19 08:05:47,
    //     "blowerId": 4
    // },]

    //this function except to get data = array!!!!
    shofarBlowerPub.createNewPubMeeting = async (data, blowerId, options) => {
        let meetingDataArray = []
        if (options.accessToken && options.accessToken.userId) {
            for (let i = 0; i < data.length; i++) {

                let meetingData = data[i];

                let city;
                if (typeof meetingData.city !== 'number') { //sometimes this function gets already cityId so we don't need to find the city id
                    //find the city or create one
                    try {
                        //check if the city is exist in city table
                        city = await shofarBlowerPub.app.models.City.findOne({ where: { "name": meetingData.city } });
                        //the city doesnt exist-> create the city
                        if (!city || !city.id) {
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
                }

                let newPubMeeting = {
                    "cityId": city ? city.id : meetingData.city,
                    "street": meetingData.street,
                    "comments": meetingData.placeDescription || meetingData.comments,
                    "start_time": meetingData.time,
                    "blowerId": blowerId
                }
                meetingDataArray.push(newPubMeeting)
            }
            try {

                //create new public meeting
                let res = await shofarBlowerPub.create(meetingDataArray);
                if (res) return res.id;

            } catch (error) {
                throw error;
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

