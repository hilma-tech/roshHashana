'use strict';
const eachOfSeries = require('async/eachOfSeries');
// const mustache = require('mustache');
const path = require('path');
const fs = require('fs');

var logNotification = require('debug')('model:Notitication');

module.exports = function (Notifications) {

    Notifications.newActivity = function (data, cb) {
        //over here do everything you want to do on new notification.
        cb(null,{});
    }

    Notifications.remoteMethod('newActivity', {
        http: {verb: 'post'},
        accepts: { arg: 'data', type: 'object' },
        returns: { arg: 'res', type: 'object', root: true }
    });


};
