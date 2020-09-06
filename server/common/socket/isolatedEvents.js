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
    updateIsolated: async function (Model, data, oldData, newMeetingId) {
        console.log('data: ', data);

    }
}