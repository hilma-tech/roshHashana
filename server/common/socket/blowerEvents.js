module.exports = {
    assignMeetingSb: async function (Model, data) {
        Model.app.io.to('blower-events').emit('newMeetingAssigned', data);
    }
    ,
    deleteMeeting: async function (Model, data, isMeetingDeleted, isolatedNum) {
        let objToSend = isMeetingDeleted ? { ...data, meetingDeleted: true } : data;
        if (!isMeetingDeleted) objToSend.isolatedNum = isolatedNum;
        Model.app.io.to('blower-events').emit('removeMeetingFromRoute', objToSend);
    }
}