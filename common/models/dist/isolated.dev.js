'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var CONSTS = require('../../server/common/consts/consts');

var checkDateBlock = require('../../server/common/checkDateBlock');

var to = require('../../server/common/to');

var executeMySqlQuery = function executeMySqlQuery(Model, query) {
  return regeneratorRuntime.async(function executeMySqlQuery$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(to(new Promise(function (resolve, reject) {
            Model.dataSource.connector.query(query, function (err, res) {
              if (err) {
                reject(err);
                return;
              }

              resolve(res);
            });
          })));

        case 2:
          return _context.abrupt("return", _context.sent);

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};

module.exports = function (Isolated) {
  var ISOLATED_ROLE = 1;

  Isolated.InsertDataIsolated = function _callee(data, options) {
    var isolatedInfo, pubMeetId, city, addressArr, meetData, objToIsolated, objToCU, resRole, resIsolated, resCU;
    return regeneratorRuntime.async(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!checkDateBlock('DATE_TO_BLOCK_ISOLATED')) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return", CONSTS.CURRENTLY_BLOCKED_ERR);

          case 2:
            if (!(options.accessToken && options.accessToken.userId)) {
              _context2.next = 44;
              break;
            }

            _context2.prev = 3;
            _context2.next = 6;
            return regeneratorRuntime.awrap(Isolated.findOne({
              where: {
                "userIsolatedId": options.accessToken.userId
              }
            }));

          case 6:
            isolatedInfo = _context2.sent;

            if (isolatedInfo) {
              _context2.next = 38;
              break;
            }

            pubMeetId = null;

            if (!(!Array.isArray(data.address) || data.address.length !== 2)) {
              _context2.next = 12;
              break;
            }

            console.log("ADDRESS NOT VALID");
            return _context2.abrupt("return", {
              ok: false,
              err: "כתובת אינה תקינה"
            });

          case 12:
            if (!(!data.address[0] || data.address[0] === "NOT_A_VALID_ADDRESS" || _typeof(data.address[1]) !== "object" || !data.address[1].lng || !data.address[1].lat)) {
              _context2.next = 15;
              break;
            }

            console.log("ADDRESS NOT VALID");
            return _context2.abrupt("return", {
              ok: false,
              err: 'נא לבחור מיקום מהרשימה הנפתחת'
            });

          case 15:
            data.address[0] = data.address[0].substring(0, 398); // shouldn't be more than 400 

            addressArr = data.address && data.address[0];

            if (typeof addressArr === "string" && addressArr.length) {
              addressArr = addressArr.split(", ");
              city = Isolated.app.models.CustomUser.getLastItemThatIsNotIsrael(addressArr, addressArr.length - 1) || addressArr[addressArr.length - 1];
            } //create public meeting


            if (!data.public_meeting) {
              _context2.next = 23;
              break;
            }

            meetData = [{
              "address": data.address,
              "comments": data.comments && data.comments.length < 255 ? data.comments : '',
              "start_time": null,
              city: city
            }];
            _context2.next = 22;
            return regeneratorRuntime.awrap(Isolated.app.models.shofarBlowerPub.createNewPubMeeting(meetData, null, options));

          case 22:
            pubMeetId = _context2.sent;

          case 23:
            objToIsolated = {
              "userIsolatedId": options.accessToken.userId,
              "public_phone": data.public_phone,
              "public_meeting": data.public_meeting,
              "blowerMeetingId": pubMeetId
            }, objToCU = {
              "address": data.address[0],
              "lng": data.address[1].lng,
              "lat": data.address[1].lat,
              "comments": data.comments && data.comments.length < 255 ? data.comments : '',
              city: city
            };
            _context2.next = 26;
            return regeneratorRuntime.awrap(Isolated.app.models.RoleMapping.findOne({
              where: {
                principalId: options.accessToken.userId
              }
            }));

          case 26:
            resRole = _context2.sent;

            if (!(resRole.roleId === ISOLATED_ROLE)) {
              _context2.next = 37;
              break;
            }

            _context2.next = 30;
            return regeneratorRuntime.awrap(Isolated.create(objToIsolated));

          case 30:
            resIsolated = _context2.sent;
            _context2.next = 33;
            return regeneratorRuntime.awrap(Isolated.app.models.CustomUser.updateAll({
              id: options.accessToken.userId
            }, objToCU));

          case 33:
            resCU = _context2.sent;
            return _context2.abrupt("return", {
              ok: true
            });

          case 37:
            return _context2.abrupt("return", {
              ok: false,
              err: "No permissions"
            });

          case 38:
            _context2.next = 44;
            break;

          case 40:
            _context2.prev = 40;
            _context2.t0 = _context2["catch"](3);
            console.log("Can`t do create new isolated", _context2.t0);
            throw _context2.t0;

          case 44:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[3, 40]]);
  };

  Isolated.remoteMethod('InsertDataIsolated', {
    http: {
      verb: 'post'
    },
    accepts: [{
      arg: 'data',
      type: 'object'
    }, {
      arg: 'options',
      type: 'object',
      http: 'optionsFromRequest'
    }],
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });

  Isolated.updateMyStartTime = function (options, meetings, cb) {
    if (checkDateBlock('DATE_TO_BLOCK_BLOWER')) {
      //block the function
      return cb(null, CONSTS.CURRENTLY_BLOCKED_ERR);
    }

    console.log('updateMyStartTime:');

    if (!options || !options.accessToken || !options.accessToken.userId) {
      console.log("NO_USER_ID_IN_OPTIONS in updateMyStartTime, meetings are:", meetings);
      return;
    }

    (function _callee2() {
      var _ref, _ref2, uErr, uRes, errFlag, meeting, i, _ref3, _ref4, _uErr, _uRes;

      return regeneratorRuntime.async(function _callee2$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!Isolated.checkMeetingToUpdate(meetings)) {
                _context3.next = 15;
                break;
              }

              _context3.next = 3;
              return regeneratorRuntime.awrap(singleStartTimeUpdate(meetings));

            case 3:
              _ref = _context3.sent;
              _ref2 = _slicedToArray(_ref, 2);
              uErr = _ref2[0];
              uRes = _ref2[1];

              if (!(uErr || !uRes)) {
                _context3.next = 12;
                break;
              }

              console.log('update (not array) start time error: ', uErr);
              return _context3.abrupt("return", cb(true));

            case 12:
              return _context3.abrupt("return", cb(null, true));

            case 13:
              _context3.next = 40;
              break;

            case 15:
              if (!Array.isArray(meetings)) {
                _context3.next = 38;
                break;
              }

              errFlag = false;
              _context3.t0 = regeneratorRuntime.keys(meetings);

            case 18:
              if ((_context3.t1 = _context3.t0()).done) {
                _context3.next = 33;
                break;
              }

              i = _context3.t1.value;
              meeting = meetings[i];
              _context3.next = 23;
              return regeneratorRuntime.awrap(Isolated.singleStartTimeUpdate(meeting));

            case 23:
              _ref3 = _context3.sent;
              _ref4 = _slicedToArray(_ref3, 2);
              _uErr = _ref4[0];
              _uRes = _ref4[1];

              if (!_uErr) {
                _context3.next = 31;
                break;
              }

              errFlag = true;
              console.log("update start time of item (".concat(i, ": ").concat(meeting, ") from array error: "), _uErr);
              return _context3.abrupt("continue", 18);

            case 31:
              _context3.next = 18;
              break;

            case 33:
              if (!errFlag) {
                _context3.next = 35;
                break;
              }

              return _context3.abrupt("return", cb("ONE_UPDATE_ERROR_AT_LEAST"));

            case 35:
              return _context3.abrupt("return", cb(null, true));

            case 38:
              console.log("wrong var type", meetings);
              return _context3.abrupt("return", cb(true));

            case 40:
            case "end":
              return _context3.stop();
          }
        }
      });
    })();
  };

  Isolated.remoteMethod('updateMyStartTime', {
    http: {
      verb: 'POST'
    },
    accepts: [{
      arg: 'options',
      type: 'object',
      http: 'optionsFromRequest'
    }, {
      arg: 'meetings',
      type: 'any'
    }],
    returns: {
      arg: 'res',
      type: 'boolean',
      root: true
    }
  });

  Isolated.checkMeetingToUpdate = function (m) {
    return m && _typeof(m) === "object" && !Array.isArray(m) && m.meetingId && m.isPublicMeeting !== null && m.isPublicMeeting !== undefined && m.startTime;
  };

  Isolated.singleStartTimeUpdate = function _callee3(meeting) {
    var updateQ;
    return regeneratorRuntime.async(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            updateQ = generateUpdateQ(meeting.meetingId, meeting.isPublicMeeting, meeting.startTime);

            if (updateQ) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", [null]);

          case 3:
            _context4.next = 5;
            return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
              Isolated.dataSource.connector.query(updateQ, function (err, res) {
                if (err || !res) resolve([err]);else resolve([null, res]);
              });
            }));

          case 5:
            return _context4.abrupt("return", _context4.sent);

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    });
  };

  var generateUpdateQ = function generateUpdateQ(meetingId, isPublicMeeting, newStartTime) {
    if (!meetingId || isNaN(Number(meetingId)) || typeof isPublicMeeting !== "boolean" && isPublicMeeting != 0 && isPublicMeeting != 1 || !newStartTime) return null;
    var formattedStartTime = new Date(newStartTime).toJSON().split("T").join(" ").split(/\.\d{3}\Z/).join("");
    return "UPDATE ".concat(isPublicMeeting ? "shofar_blower_pub" : "isolated", " \n        SET ").concat(isPublicMeeting ? "start_time" : "meeting_time", " = \"").concat(formattedStartTime, "\"\n                    WHERE id = ").concat(meetingId);
  }; //admin 


  Isolated.getIsolatedsForAdmin = function (limit, filter, cb) {
    (function _callee4() {
      var where, isolatedQ, countQ, _ref5, _ref6, isolatedErr, isolatedRes, _ref7, _ref8, countErr, countRes;

      return regeneratorRuntime.async(function _callee4$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              where = '';

              if (filter.address && filter.address.length > 0) {
                where += "WHERE MATCH(cu.address) AGAINST ('".concat(filter.address, "') ");
              }

              if (filter.name && filter.name.length > 0) {
                where += "".concat(where.length > 0 ? ' AND' : 'WHERE', " MATCH(cu.name) AGAINST ('").concat(filter.name, "')");
              }

              if (filter.haveMeeting === true) {
                where += "".concat(where.length > 0 ? ' AND' : 'WHERE', " (isolated.public_meeting = 0 AND isolated.blowerMeetingId IS NOT NULL) OR\n                    (isolated.public_meeting = 1 AND sbp.blowerId IS NOT NULL)");
              } else if (filter.haveMeeting === false) {
                where += "".concat(where.length > 0 ? ' AND' : 'WHERE', " (isolated.public_meeting = 0 AND isolated.blowerMeetingId IS NULL) OR\n                    (isolated.public_meeting = 1 AND sbp.blowerId IS NULL)");
              }

              isolatedQ = "SELECT isolated.id, cu.name, isolated.public_phone, cu.username, cu.address \n                FROM isolated \n                    LEFT JOIN CustomUser cu ON isolated.userIsolatedId = cu.id\n                    LEFT JOIN shofar_blower_pub sbp ON isolated.blowerMeetingId = sbp.id  \n                ".concat(where, "\n                ORDER BY cu.name\n                LIMIT 0, 20");
              countQ = "SELECT COUNT(*) as resNum\n                FROM isolated \n                LEFT JOIN CustomUser cu ON isolated.userIsolatedId = cu.id\n                LEFT JOIN shofar_blower_pub sbp ON isolated.blowerMeetingId = sbp.id  \n                ".concat(where);
              _context5.next = 9;
              return regeneratorRuntime.awrap(executeMySqlQuery(Isolated, isolatedQ));

            case 9:
              _ref5 = _context5.sent;
              _ref6 = _slicedToArray(_ref5, 2);
              isolatedErr = _ref6[0];
              isolatedRes = _ref6[1];

              if (!(isolatedErr || !isolatedRes)) {
                _context5.next = 16;
                break;
              }

              console.log('get isolated admin request error : ', isolatedErr);
              throw isolatedErr;

            case 16:
              _context5.next = 18;
              return regeneratorRuntime.awrap(executeMySqlQuery(Isolated, countQ));

            case 18:
              _ref7 = _context5.sent;
              _ref8 = _slicedToArray(_ref7, 2);
              countErr = _ref8[0];
              countRes = _ref8[1];

              if (!(countErr || !countRes)) {
                _context5.next = 25;
                break;
              }

              console.log('get isolated admin request error : ', countErr);
              throw countErr;

            case 25:
              isolatedRes = isolatedRes.map(function (isolated) {
                if (isolated.public_phone === 1) isolated.phone = isolated.username;
                delete isolated.username;
                delete isolated.public_phone;
                return isolated;
              });
              return _context5.abrupt("return", cb(null, {
                isolateds: isolatedRes,
                resNum: countRes[0].resNum
              }));

            case 29:
              _context5.prev = 29;
              _context5.t0 = _context5["catch"](0);
              cb(_context5.t0);

            case 32:
            case "end":
              return _context5.stop();
          }
        }
      }, null, null, [[0, 29]]);
    })();
  };

  Isolated.remoteMethod('getIsolatedsForAdmin', {
    http: {
      verb: 'POST'
    },
    accepts: [{
      arg: 'limit',
      type: 'object'
    }, {
      arg: 'filter',
      type: 'object'
    }],
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });

  Isolated.deleteIsolatedAdmin = function (id, cb) {
    (function _callee5() {
      var isolatedInfo, participantsNum;
      return regeneratorRuntime.async(function _callee5$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _context6.next = 3;
              return regeneratorRuntime.awrap(Isolated.findById(id, {
                fields: {
                  public_meeting: true,
                  blowerMeetingId: true,
                  userIsolatedId: true
                }
              }));

            case 3:
              isolatedInfo = _context6.sent;

              if (!isolatedInfo.public_meeting) {
                _context6.next = 12;
                break;
              }

              if (!isolatedInfo.blowerMeetingId) {
                _context6.next = 12;
                break;
              }

              _context6.next = 8;
              return regeneratorRuntime.awrap(Isolated.count({
                and: [{
                  'blowerMeetingId': isolatedInfo.blowerMeetingId
                }, {
                  public_meeting: 1
                }]
              }));

            case 8:
              participantsNum = _context6.sent;

              if (!(participantsNum <= 1)) {
                _context6.next = 12;
                break;
              }

              _context6.next = 12;
              return regeneratorRuntime.awrap(Isolated.app.models.shofarBlowerPub.destroyById(isolatedInfo.blowerMeetingId));

            case 12:
              _context6.next = 14;
              return regeneratorRuntime.awrap(Isolated.destroyById(id));

            case 14:
              _context6.next = 16;
              return regeneratorRuntime.awrap(Isolated.app.models.CustomUser.destroyById(isolatedInfo.userIsolatedId));

            case 16:
              return _context6.abrupt("return", cb(null, 'SUCCESS'));

            case 19:
              _context6.prev = 19;
              _context6.t0 = _context6["catch"](0);
              console.log(_context6.t0);
              return _context6.abrupt("return", cb(_context6.t0));

            case 23:
            case "end":
              return _context6.stop();
          }
        }
      }, null, null, [[0, 19]]);
    })();
  };

  Isolated.remoteMethod('deleteIsolatedAdmin', {
    http: {
      verb: 'POST'
    },
    accepts: [{
      arg: 'id',
      type: 'number',
      require: true
    }],
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });

  Isolated.getNumberOfIsolatedWithoutMeeting = function (cb) {
    (function _callee6() {
      var _ref9, _ref10, err, res;

      return regeneratorRuntime.async(function _callee6$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return regeneratorRuntime.awrap(executeMySqlQuery(Isolated, "SELECT COUNT(*) as resNum\n                FROM isolated\n                WHERE isolated.blowerMeetingId IS NULL;"));

            case 2:
              _ref9 = _context7.sent;
              _ref10 = _slicedToArray(_ref9, 2);
              err = _ref10[0];
              res = _ref10[1];
              if (err) cb(err);

              if (!res) {
                _context7.next = 9;
                break;
              }

              return _context7.abrupt("return", cb(null, res));

            case 9:
            case "end":
              return _context7.stop();
          }
        }
      });
    })();
  };

  Isolated.remoteMethod('getNumberOfIsolatedWithoutMeeting', {
    http: {
      verb: 'POST'
    },
    accepts: [],
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });

  Isolated.getNumberOfMeetings = function (cb) {
    (function _callee7() {
      var _ref11, _ref12, err, res;

      return regeneratorRuntime.async(function _callee7$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(executeMySqlQuery(Isolated.app.models.shofarBlowerPub, "SELECT  (\t\n                    (\n                    SELECT COUNT(*) as resNum\n                    FROM shofar_blower_pub\n                    LEFT JOIN CustomUser blowerUser ON blowerUser.id = shofar_blower_pub.blowerId\n                    LEFT JOIN shofar_blower ON blowerUser.id = shofar_blower.userBlowerId \n                    WHERE blowerId IS NOT NULL AND shofar_blower.confirm = 1\n                    )+(\n                    SELECT COUNT(*)                     \n                    FROM isolated\n                    WHERE \n                    isolated.blowerMeetingId IS NOT NULL\n                    AND isolated.public_meeting = 0\n                    )\n                    ) \n                    AS resNum;"));

            case 2:
              _ref11 = _context8.sent;
              _ref12 = _slicedToArray(_ref11, 2);
              err = _ref12[0];
              res = _ref12[1];
              if (err) cb(err);

              if (!res) {
                _context8.next = 9;
                break;
              }

              return _context8.abrupt("return", cb(null, res[0].resNum));

            case 9:
            case "end":
              return _context8.stop();
          }
        }
      });
    })();
  };

  Isolated.remoteMethod('getNumberOfMeetings', {
    http: {
      verb: 'POST'
    },
    accepts: [],
    returns: {
      arg: 'res',
      type: 'number',
      root: true
    }
  });

  Isolated.getParticipantsMeeting = function (id, cb) {
    (function _callee8() {
      var _ref13, _ref14, err, res;

      return regeneratorRuntime.async(function _callee8$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(executeMySqlQuery(Isolated, "\n                SELECT\n                    isolatedUser.name AS \"name\",\n                    isolatedUser.username AS \"phone\",\n                    isolatedUser.id AS \"id\",\n                    RoleMapping.roleId AS \"role\" \n                FROM isolated\n                    LEFT JOIN CustomUser isolatedUser ON isolatedUser.id = isolated.userIsolatedId\n                    LEFT join RoleMapping on RoleMapping.principalId= isolatedUser.id\n                    WHERE blowerMeetingId = ".concat(id, ";     \n            ")));

            case 2:
              _ref13 = _context9.sent;
              _ref14 = _slicedToArray(_ref13, 2);
              err = _ref14[0];
              res = _ref14[1];
              if (err) cb(err);

              if (!res) {
                _context9.next = 9;
                break;
              }

              return _context9.abrupt("return", cb(null, res));

            case 9:
            case "end":
              return _context9.stop();
          }
        }
      });
    })();
  };

  Isolated.remoteMethod('getParticipantsMeeting', {
    http: {
      verb: 'POST'
    },
    accepts: [{
      arg: 'id',
      type: 'number',
      require: true
    }],
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });

  Isolated.deleteConectionToMeeting = function (id, cb) {
    (function _callee9() {
      var _ref15, _ref16, err, res;

      return regeneratorRuntime.async(function _callee9$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(to(Isolated.update()));

            case 2:
              _ref15 = _context10.sent;
              _ref16 = _slicedToArray(_ref15, 2);
              err = _ref16[0];
              res = _ref16[1];
              if (err) cb(err);

              if (!res) {
                _context10.next = 9;
                break;
              }

              return _context10.abrupt("return", cb(null, res));

            case 9:
            case "end":
              return _context10.stop();
          }
        }
      });
    })();
  };

  Isolated.remoteMethod('deleteConectionToMeeting', {
    http: {
      verb: 'POST'
    },
    accepts: [{
      arg: 'id',
      type: 'number'
    }],
    returns: {
      arg: 'res',
      type: 'object',
      root: true
    }
  });
};