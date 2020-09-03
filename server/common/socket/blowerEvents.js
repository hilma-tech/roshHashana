const { Modal } = require("@material-ui/core");

module.exports = {
    assignMeetingSb: async function (Model, data) {
        Model.app.io.to('blower-events').emit('newMeetingAssined', data);
    }
    ,
    deleteMeeting: async function (Model, data, isMeetingDeleted, isolatedNum) {
        let objToSend = isMeetingDeleted ? {} : data;
        if (!isMeetingDeleted) objToSend.isolatedNum = isolatedNum;
        Model.app.io.to('blower-events').emit('removeMeetingFromRoute', objToSend);
    }
}