module.exports = {
    deleteIsolated: async function (Model, data) {
        if ((!data.public_meeting && !data.blowerMeetingId)/*private meeting with no blower */
            || (data.public_meeting && !data.hasBlower)/*public meeting with no blower */) {
            //doesn't have blower
            Model.app.io.to('isolated-events').emit('removeMeeting', data);
            return;
        }
        if ((!data.public_meeting && data.blowerMeetingId)/*private meeting with blower */
            || (data.public_meeting && data.hasBlower)/*public meeting with blower */) {
            //has blower
            Model.app.io.to('isolated-events').emit('removeMeetingWithBlower', data);
            return;
        }
    },
    modifyIsolatorInfo: async function (Model, newData, oldData, newMeetingId) {
        const objToSocketEvent = { ...newData, ...oldData, newMeetingId: newMeetingId };
        Model.app.io.to('isolated-events').emit('modifyIsolatorInfo', objToSocketEvent);
    },
    newIsolator: async function (Model, newData, oldData, newMeetingId) {
        const objToSocketEvent = { ...oldData.__data || oldData, ...newData, newMeetingId: newMeetingId };
        Model.app.io.to('isolated-events').emit('newIsolator', objToSocketEvent);
    },
    modifyIsolatorInRoute: async function (Model, newData, oldData, newMeetingId) {
        const objToSocketEvent = { ...oldData, ...newData, newMeetingId: newMeetingId, address: Array.isArray(newData.address)? newData.address[0]: newData.address };
        Model.app.io.to('isolated-events').emit('modifyIsolatorInRoute', objToSocketEvent);
    }
}