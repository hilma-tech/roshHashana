'use strict';
const moment = require('moment');


module.exports = function (usersArchive) {

    usersArchive.addUserToArchive = async (userData) => {
        try {
            let data = { ...userData };
            data.created = moment(new Date());
            usersArchive.create(data);
        } catch (error) {
            throw error;
        }
    }

    usersArchive.remoteMethod('addUserToArchive', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'userData', type: 'object' },
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
}
