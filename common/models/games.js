// 'use strict';
// const eachOfSeries = require('async/eachOfSeries');
// const tools = require('../../server/modules/tools');
// const AsyncTools = require('../../server/modules/AsyncTools');
// const ValidateTool = require('../../server/modules/ValidateTool');

// const ERRORS = {
//     NO_NAME: { code: 1 },
//     GAME_EXISTS: { message: "Game with this name alreay exists!", code: 2 }
// }

// var logGames = require('debug')('model:games');

// module.exports = function (Games) {

//     Games.observe('loaded', function (ctx, next) {
//         let Likes = Games.app.models.Likes;
//         let PlayedGames = Games.app.models.PlayedGames;
//         if (!ctx.isNewInstance && ctx.options.accessToken) {
//             return Likes.find({ where: { gameId: ctx.data.id } }, { localFind: true }, function (err, res) {
//                 if (err) {
//                     console.log("ERR", err.message);
//                     return next({});
//                 }
//                 ctx.data.like = res.filter((like) => like.playerId == ctx.options.accessToken.userId).map(item => { item.playerId = null; return item; }); //do not send userid to client!
//                 ctx.data.likesCount = res.filter(like => like.isLiked).length;

//                 return PlayedGames.find({ where: { gameId: ctx.data.id, playerId: ctx.options.accessToken.userId } }, ctx.options, (err, res) => {
//                     if (err) {
//                         console.log("ERR", err.message);
//                         return next({});
//                     } ctx.data.isPlayed = res.length;
//                     next();

//                 })
//             });
//         }
//         next();
//     });


//     Games.saveStageAndRows = function (data, options, cb) {
//         (async () => {
//             let valid = ValidateTool.runValidate(data, saveGameRules, saveGameFields);
//             if (!valid.success) {
//                 cb({ "fail": 1 });
//                 console.log("WOW NOT WORKING");
//             }
//             data = valid.data;
//             options.localFind = true;

//             const ImageModel = Games.app.models.Image;
//             if (!data.gameId && !data.gameData.title && !data.gameData.description)
//                 return cb({ success: 0, creatushError: ERRORS.NO_NAME }, null);

//             let ownerId = 0;
//             if (data.gameId) {
//                 let [err, thisGame] = await AsyncTools.to(Games.findOne({ where: { id: data.gameId } }, options))
//                 if (err) {
//                     console.error("ERR on save stage and rows", err)
//                     return cb({});
//                 }
//                 ownerId = thisGame.ownerId;
//             }
//             else ownerId = options.accessToken.userId; //todo
//             data.ownerId = ownerId;
//             data.gameData.title = data.gameData.title.trim();
//             let [err, myGames] = await AsyncTools.to(Games.find({ where: { ownerId: ownerId, title: data.gameData.title } }, options));
//             if (err) {
//                 console.error(err.message);
//                 return cb({});
//             }
//             if (!data.gameId && myGames[0] && myGames[0].title == data.gameData.title)
//                 return cb({ statusCode: 406, success: 0, creatushError: ERRORS.GAME_EXISTS }, null);

//             if (data.gameData.Image && data.gameData.Image.url) {//promisify this!!!!
//                 if (myGames[0] && myGames[0]['imgId'] != data.gameData.imgId || !myGames[0]) {//check if we need to save to server from web-API.
//                     let [err, res] = await AsyncTools.to(ImageModel.downloadToServerPromise(data.gameData.Image, { accessToken: { userId: ownerId } })); //sending owner id inside options, so it wont be replaced by accident.
//                     if (err) {
//                         console.error("error on save image for game", err);
//                         return cb({});
//                     }
//                     else data.gameData.imgId = res.id; //set imgId from db
//                 }
//             }
//             return saveGameData(data, options, cb); // in case it will return userid- clean up
//         })();
//     };

//     let saveGameData = function (data, options, cb) {
//         (async () => {
//             let gamePayload = {
//                 id: data.gameId,
//                 ownerId: data.ownerId,
//                 title: data.gameData.title,
//                 playedNum: 0,
//                 description: data.gameData.description,
//                 schoolName: "",
//                 tag: data.gameData.tag ? data.gameData.tag : null,
//                 forClass: data.gameData.for_class ? data.gameData.for_class : null,
//                 likes: 0,
//                 status: data.status ? data.status : "pending",
//                 published: data.status === "published" ? Date.now() : null,
//                 imgId: data.gameData.imgId
//             };

//             let userId = data.ownerId;
//             const CustomUser = Games.app.models.CustomUser;

//             if (data.status === "published" && data.gameData.status != 'published' && data.points) {
//                 let [err, pointsRes] = await AsyncTools.to(CustomUser.addPointsPromise({ userId: data.ownerId, points: data.points }));//promisify this!!!! todo
//                 if (err) {
//                     console.error(err.message);
//                     return cb({});
//                 }
//                 logGames("points res,", pointsRes);
//             }
//             let [upserErr, gameRes] = await AsyncTools.to(Games.upsert(gamePayload, options))
//             if (upserErr) {
//                 console.error(upserErr.message);
//                 return cb({});
//             }
//             data.gameId = gameRes.id;
//             return saveStages(data, userId, options, cb);
//         })();
//     };

//     let saveStages = function (data, userId, options, cb) {
//         (async () => {
//             options.localFind = true;

//             const GameStages = Games.app.models.GameStages;
//             if (data.rowsArr[0] && data.rowsArr[0]['stageId']) { // if there is stage we can immediately save the rows. (obviously update action)
//                 return saveRows(data, data.rowsArr[0]['stageId'], userId, options, cb);
//             }

//             let [foundErr, foundStages] = await AsyncTools.to(GameStages.find({ where: { gameId: data.gameId } }, options));
//             if (foundErr) {
//                 console.error(foundErr.message);
//                 return cb({});
//             }
//             let stageIndex = 0;
//             if (foundStages.length > 0) {
//                 logGames(data.gameId, " found stage!!", foundStages);
//                 foundStages.forEach(element => { // new stage index will be the highest index.
//                     if (element.stageId > stageIndex)
//                         stageIndex = element.stageId;
//                 });
//                 stageIndex++;
//             }
//             let [err, stage] = await AsyncTools.to(GameStages.upsert({ gameId: data.gameId, stageIndex: stageIndex, type: data.type }))
//             if (err) {
//                 console.error(err.message);
//                 return cb({});
//             }
//             return saveRows(data, stage.id, userId, options, cb);
//         })();


//     }

//     let saveRows = function (data, stageId, userId, options, cb) {
//         (async () => {
//             options.localFind = true;

//             let result = [];
//             //we want to save data.comment
//             const GameRows = Games.app.models.GameRows;
//             const GamesComments = Games.app.models.GamesComments;
//             let [err, stageRows] = await AsyncTools.to(GameRows.find({ where: { stageId: stageId } }, options))
//             if (err) {
//                 console.error(err.message);
//                 return cb({});
//             }
//             eachOfSeries(data.rowsArr, function (value, key, callback) {
//                 (async () => {
//                     value['stageId'] = stageId;
//                     value['imgInfo'] = value.Image;
//                     let [err, row] = await AsyncTools.to(GameRows.upsert(value, { accessToken: { userId: userId }, localFind: true }))
//                     if (err) {
//                         console.error(err.message);
//                         return cb({});
//                     }
//                     for (let i = 0; i < stageRows.length; i++) { // this loop checks if a card was deleted in client, and deletes it here.
//                         if (row.id == stageRows[i].id) {// in stageRows we keep all old stages. if row.id is in stageRows, it means it wasnt deleted, so we remove from the list. at the end(END) we will delete all the list remaining content.
//                             stageRows.splice(i, 1);
//                         }
//                     }
//                     if (row.rowComment && row.rowComment.commentText) {
//                         let rowCommentToSave = {
//                             id: row.rowComment.id ? row.rowComment.id : null, //todo-- will we create new comments in this ping-pong?
//                             rowId: row.id,
//                             commentorId: userId,
//                             gameId: data.gameId,
//                             commentText: row.rowComment.commentText,
//                             emoji: null
//                         }
//                         let [comErr, comRes] = await AsyncTools.to(GamesComments.upsert(rowCommentToSave));
//                         if (comErr) {
//                             console.log(comErr.message);
//                             return cb({});
//                         }
//                     }
//                     result.push(row);
//                     callback();
//                 })()

//             }, function (err) {
//                 if (err) {
//                     console.error(err.message);
//                     return cb({});
//                 }
//                 else {
//                     if (stageRows.length !== 0) {
//                         stageRows.forEach(item => { //(END) delete all rows that was deleted in the client's side.
//                             GameRows.destroyById(item.id, (err, res) => {
//                                 if (err) {
//                                     console.log("ERRR", err)
//                                     return cb({});
//                                 }
//                             })
//                         })
//                     }
//                     //save comments
//                     if (data.comment && data.comment.commentText) {
//                         let commentToSave = {
//                             id: data.comment.id ? data.comment.id : null,
//                             commentorId: userId,
//                             gameId: data.gameId,
//                             commentText: data.comment.commentText,
//                             rowId: null,
//                             emoji: data.comment.emoji
//                         };
//                         GamesComments.upsert(commentToSave, (err, res) => {
//                             if (err) {
//                                 console.log(err.message);
//                                 return cb({});
//                             }
//                             else {
//                                 console.log("resof comment", res);
//                                 cb(null, { success: 1, result: { cards: result, gameId: data.gameId } });

//                             }
//                         })
//                     }
//                     else cb(null, { success: 1, result: { cards: result, gameId: data.gameId } });


//                 }
//             });
//         })();
//     }




//     Games.delete = function (id, options, cb) {
//         (async () => {
//             options.localFind = true;
//             if (!id || parseInt(id) <= 0) {
//                 console.error("Need gameId to delete.")
//                 return cb({});
//             }
//             //~~~ here we check if the user is authorized to delete the game.
//             try {
//                 let theGame = await Games.findOne({ where: { id: id }, include: 'CustomUser' }, options);
//                 theGame = theGame.toJSON(); //this is how we can get the relation, not as a function.
//                 if (theGame.ownerId !== options.accessToken.userId) {
//                     let currentUser = await Games.app.models.CustomUser.findOne({ where: { id: options.accessToken.userId }, include: "RoleMapping" }, options)
//                     if (currentUser.RoleMapping.roleId == 4) { //if its just a student- dont allow!!
//                         console.error("hack attemp in delete Game!!");
//                         return cb({});
//                     }

//                     let scools = JSON.parse(currentUser.school);
//                     if (typeof scools === "number") { // not array
//                         if (scools != theGame.CustomUser.school) {
//                             console.error("attemp to hack!! delete game")
//                             return cb({});
//                         }
//                     }
//                     else if (!theGame.CustomUser.school in scools) {
//                         console.error("you are not authorized teachr!");
//                         return cb({});
//                     }
//                 }
//             }
//             catch (err) { console.error(err); return cb({}); }
//             //~~~end of check. 

//             const GameStages = Games.app.models.GameStages;
//             const GamesComments = Games.app.models.GamesComments;
//             const PlayedGames = Games.app.models.PlayedGames;
//             const GameLikes = Games.app.models.Likes;
//             PlayedGames.deleteAll({ gameId: id }, function (err) {
//                 if (err) throw err;
//                 else console.log("played record's successfuly deleted.")
//             })
//             GameLikes.deleteAll({ gameId: id }, function (err) {
//                 if (err) throw err;
//                 else console.log("played record's successfuly deleted.")
//             })
//             GamesComments.deleteAll({ gameId: id }, function (err) {
//                 if (err) throw err;
//                 else console.log("comments record's successfuly deleted.")
//             })
//             return GameStages.find({ where: { gameId: id } }, options, function (err, res) {//promisify this!!!!
//                 eachOfSeries(res, (instance, index, callback) => {
//                     GameStages.delete(instance.id, function (err) {
//                         if (err) {
//                             console.log("ERR", err)
//                             callback(err)
//                         }
//                         else {
//                             console.log(`deleted stage ${instance.id} and it rows.`);
//                             callback();
//                         }
//                     })
//                 }, function (err) {
//                     if (err) {
//                         console.error("error!!!", err)
//                         return cb({});
//                     }
//                     else {
//                         return Games.deleteById(id, function (err, res) {
//                             if (err) {
//                                 console.log("ERROR", err)
//                                 return cb({});
//                             }
//                             else return cb(null, { success: 1 });
//                         })

//                     }
//                 })
//             });
//         })()
//     };

//     Games.fetchWhereAndInclude = function (filter, options, cb) { //For teachers, to get only their schools games.
//         (async () => {
//             try {
//                 let userId = options.accessToken.userId;
//                 filter = filter ? JSON.parse(filter) : {};

//                 let currentUser = await Games.app.models.CustomUser.findOne({ where: { id: userId }, include: "RoleMapping" }, { localFind: true });
//                 currentUser = currentUser.toJSON();
//                 if (currentUser.RoleMapping.roleId === 4) { //if the user is a student.
//                     filter = tools.mergeDeep(filter, { where: { ownerId: userId } });
//                     return Games.find(filter, options, cb);
//                 }

//                 let tempFilter = filter;
//                 if (Array.isArray(filter.include)) { // we want to make sure we are including school.
//                     tempFilter.include = filter.include.map(rel => {
//                         if (rel.relation === "CustomUser") {

//                             rel = tools.mergeDeep(rel, { relation: "CustomUser", scope: { fields: { school: true } } })
//                         }
//                         return rel;
//                     });
//                 }
//                 else
//                     tempFilter = tools.mergeDeep(filter, { include: "CustomUser" });

//                 let gamesRes = await Games.findOne(tempFilter, { localFind: true });
//                 gamesRes = gamesRes.toJSON()

//                 let scools = JSON.parse(currentUser.school);

//                 if (typeof scools === "number") { // not array
//                     if (scools != gamesRes.CustomUser.school) {
//                         console.error("attemp to hack!! fetch game")
//                         return cb({});
//                     }
//                 }
//                 else if (!gamesRes.CustomUser.school in scools) {
//                     console.error("you are not authorized teachr!");
//                     return cb({});
//                 }

//                 return Games.find(filter, options, cb); //return find by origin filter.
//             }
//             catch (err) {
//                 console.error("ERROR", err);
//                 cb(null, []);
//             }
//         })()
//     };
//     const saveGameRules = {
//         rowsArr: {
//             type: 'array', extendedRules: {
//                 all: {
//                     fontSize: {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z0-9א-ת %]*",
//                             flags: "i",
//                             message: "invalid chars"
//                         },
//                         length: {
//                             maximum: 6
//                         }
//                     },
//                     cardBgColor: {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z0-9א-ת #]*",
//                             flags: "i",
//                             message: "invalid chars"
//                         }
//                     },
//                     textColor: {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z0-9א-ת #]*",
//                             flags: "i",
//                             message: "invalid chars"
//                         }
//                     },
//                     additionalData: {
//                         type: 'string',
//                         format: {
//                             pattern: '[a-zA-Z0-9{}%,./\\[\\]#"":{} _א-ת?!]*',
//                             flags: "i",
//                             message: "invalid chars"
//                         }
//                     },
//                     'Image.path': {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z0-9א-ת /.]*",
//                             flags: "i",
//                             message: "invalid chars"
//                         }
//                     }
//                 }
//             }
//         },
//         'gameData.tag': {
//             type: 'string',
//             format: {
//                 pattern: '[a-z0-9א-ת :,""{}]*',
//                 flags: "i",
//                 message: "invalid chars"
//             }

//         },
//         'gameData.created': {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת -:.]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }

//         },
//         'gameData.Image.modified': {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת -:.]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }

//         },
//         'gameData.Image.path': {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת /.]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }

//         },
//         'comment.emoji': {
//             type: 'string',
//             format: {
//                 pattern: "[a-z -]*",
//                 flags: "i",
//                 message: "invalid emoji"
//             }
//         },
//         'comment.published': {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת -:.]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }

//         },
//         'gameData.games_comments': {
//             type: 'array', extendedRules: {
//                 all: {
//                     published: {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z0-9א-ת -:.]*",
//                             flags: "i",
//                             message: "invalid chars"
//                         }
//                     },
//                     emoji: {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z -]*",
//                             flags: "i",
//                             message: "invalid emoji"
//                         }
//                     }
//                 }
//             }
//         },
//         'gameData.type': {
//             type: 'string',
//             format: {
//                 pattern: "[a-z_]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }
//         },
//         'gameData.like': {
//             type: 'array',
//             extendedRules: {
//                 all: {
//                     type: 'object',
//                     likeDate: {
//                         type: 'string',
//                         format: {
//                             pattern: "[a-z0-9א-ת -:.]*",
//                             flags: "i",
//                             message: "invalid chars"
//                         }
//                     }
//                 }
//             }

//         },
//     }
//     const saveGameFields = { comment: true, gameData: true, gameId: true, points: true, rowsArr: true, status: true, type: true };
//     Games.checkVal = function (data, options, cb) {
//         cb(null, options.accessToken);
//         // cb(null, ValidateTool.runValidate(data, saveGameRules, saveGameFields));
//     }

//     Games.updateOne = function (gameData, options, cb) {
//         let valid = ValidateTool.runValidate(gameData, gameDataRules, gameDataFields);

//         if (!valid.success) {
//             cb({ "fail": 1 });
//             console.log("WOW NOT WORKING");
//         }
//         gameData = valid.data;
//         cb(null, gameData)
//         Games.findOne({ where: { id: gameData.id } }, { localFind: true }, async (err, res) => {
//             if (err) {
//                 console.error("ERROR on updateOne:", err);
//                 return cb({});
//             }
//             if (gameData.status === "published" && res.status != 'published' && gameData.points) {
//                 let [err, pointsRes] = await AsyncTools.to(CustomUser.addPointsPromise({ userId: res.ownerId, points: gameData.points }));//promisify this!!!! todo
//                 if (err) {
//                     console.error(err.message);
//                     return cb({});
//                 }
//                 logGames("points res,", pointsRes);
//             }
//             delete gameData.CustomUser;
//             gameData.ownerId = res.ownerId;
//             Games.upsert(gameData, cb);
//         })
//     }
//     const gameDataRules = {
//         id: {
//             presence: true,
//             type: "number"
//         },
//         created: {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת -:.]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }
//         },
//         tag: {
//             type: 'string',
//             format: {
//                 pattern: '[a-z0-9א-ת :,""{}]*',
//                 flags: "i",
//                 message: "invalid chars"
//             }
//         },
//         published: {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת -:.]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }
//         },
//         forClass: {
//             type: 'string',
//             format: {
//                 pattern: "[a-z0-9א-ת/\\[\\] ,]*",
//                 flags: "i",
//                 message: "invalid chars"
//             }
//         }

//     };
//     const gameDataFields = {
//         created: true, description: true, forClass: true, id: true, imgId: true, published: true, schoolName: true, status: true, tag: true, title: true
//     };

//     Games.remoteMethod('checkVal', {
//         http: {
//             verb: 'post'
//         },
//         description: "***REMOTE*** Save game,stages,rows,comments and images. ***checks!***",
//         accepts: [
//             { arg: 'data', type: 'object' },
//             { arg: 'options', type: 'object', http: 'optionsFromRequest' }
//         ],
//         returns: { arg: 'res', type: 'object', root: true }
//     });

