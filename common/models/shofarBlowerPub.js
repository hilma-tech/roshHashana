'use strict';

module.exports = function (shofarBlowerPub) {

    //data -> [{
    //     "address": 
    //     "comments":"ליד הבית ספר",
    //     "start_time": 2020-07-19 08:05:47,
    //     "blowerId": 4
    // },]

    //this function excepts to get data as an array!!!!
    shofarBlowerPub.createNewPubMeeting = async (data, blowerId, options) => {
        if (!Array.isArray(data)) { console.log("cannot get data in createNewPubMeeting cos not an array. data:", data); return; }
        let meetingDataArray = []
        if (options.accessToken && options.accessToken.userId) {
            for (let i = 0; i < data.length; i++) {

                let meetingData = data[i];

                let newPubMeeting = {
                    "address": meetingData.address,
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
}

