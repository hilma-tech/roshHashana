'use strict';
const eachOfSeries = require('async/eachOfSeries');
const mustache = require('mustache');
const path = require('path');
const fs = require('fs');
const userAddedNewGame=require('../../server/notifications/userAddedNewGame.js')
//var assert = require('assert');
//const loopback = require('loopback');
//const ds = new loopback.DataSource(dataSourceConfig['msql']);
var notificationsTypes = {
    USER_ADDED_NEW_GAME: 0,
    TEACER_REPLIED: 1
};
var logNotification = require('debug')('model:Notitication');
var TemplateFilesPath = path.join(__dirname, '../../server/notifications/templates/');
var userAddedTemplate = fs.readFileSync(TemplateFilesPath + "USER_ADDED_NEW_GAME" + ".tpl.html", 'utf8').replace(/(\r\n|\n|\r)/gm, "");
var teacherRepliedTemplate = fs.readFileSync(TemplateFilesPath + "TEACER_REPLIED" + ".tpl.html", 'utf8').replace(/(\r\n|\n|\r)/gm, "");

module.exports = function (Notifications) {

    Notifications.newActivity = function (data, cb) {
        let payload = { created: Date.now() };
        let notificationModel = Notifications.app.models.Notification;
        let mydata = {};
        notificationModel.create(payload, (err, res) => {
            if (err) {
                cb({ success: 0, error: err }, null);
                return;
            }
            payload = res;
            mydata.notificationId = res.id;
            switch (data.notificationsType) {
                case notificationsTypes.USER_ADDED_NEW_GAME:
                    {
                     // new userAddedNewGame.register(app,payload);
                        mydata.notificationTitle = data.title;
                        mydata.userName = data.userName;
                        payload.htmlmsg = mustache.render(userAddedTemplate, mydata);
                        break;
                    }
                case notificationsTypes.TEACER_REPLIED: {
                    
                 //   new teacherRepliedActivity().register();
                    payload.htmlmsg = mustache.render(teacherRepliedTemplate, mydata);
                    break;
                }
            }
            notificationModel.upsert(payload, (err, res) => {
                if (err) {
                    cb({ success: 0, error: err }, null);
                    return;
                }
                else logNotification("notification saved, now saving maps. ", res);
                cb(null, { success: 1, res: res });
                return;
            });

        });

    }

    Notifications.remoteMethod('newActivity', {
        http: {verb: 'post'},
        accepts: { arg: 'data', type: 'object' },
        returns: { arg: 'res', type: 'object', root: true }
    });


};
