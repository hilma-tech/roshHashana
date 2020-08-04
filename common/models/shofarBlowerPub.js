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
        console.log('createNewPubMeeting data: ', data);
        if (!Array.isArray(data)) { console.log("cannot get data in createNewPubMeeting cos not an array. data:", data); return; }
        let meetingDataArray = []
        if (options.accessToken && options.accessToken.userId) {
            for (let i = 0; i < data.length; i++) {
                let meetingData = data[i];

                let city;
                let addressArr = meetingData.address && meetingData.address[0]
                console.log('meetingData.address && meetingData.address[0]: ', meetingData.address && meetingData.address[0]);
                if (typeof addressArr === "string" && addressArr.length) {
                    addressArr = addressArr.split(", ")
                    console.log('addressArr: ', addressArr);
                    city = shofarBlowerPub.app.models.CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1) || addressArr[addressArr.length - 1];
                    console.log('city: ', city);
                }


                meetingData.address[0] = meetingData.address[0].substring(0, 398)

                let newPubMeeting = {
                    "address": meetingData.address[0],
                    "lng": meetingData.address[1].lng,
                    "lat": meetingData.address[1].lat,
                    city,
                    "comments": meetingData.placeDescription || meetingData.comments,
                    "start_time": meetingData.time,
                    "blowerId": blowerId
                }
                meetingDataArray.push(newPubMeeting)
            }
            try {
                //create new public meeting
                let res = await shofarBlowerPub.create(meetingDataArray);
                if (res) return Array.isArray(res) && res.length ? res[0].id : res.id;

            } catch (error) {
                throw error;
            }
        }
    }

    shofarBlowerPub.checkIfCanDeleteMeeting = async (meetingId) => {
        //count all the users that are registered to this meeting
        let numOfRegistered = await shofarBlowerPub.app.models.Isolated.count({ where: { and: [{ public_meeting: 1 }, { blowerMeetingId: meetingId }] } });
        console.log('numOfRegistered', numOfRegistered)
        if (numOfRegistered > 1) {
            let pubMeet = await shofarBlowerPub.findOne({ where: { and: [{ id: meetingId }, { blowerId: null }] } });
            //if the meeting has no shofar blower assigned already
            console.log('pubMeet', pubMeet)
            if (pubMeet) return true;
            else return false;
        }
        else return false;
    }
}

