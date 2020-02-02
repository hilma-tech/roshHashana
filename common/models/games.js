'use strict';

const to = (promise) => {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}

module.exports = function (Games) {

    Games.createNewGame = (newGameData, options, cb) => {
        (async (cb) => {
            const token = options && options.accessToken;
            const userId = token && token.userId;
            if (!userId) return cb('NOT_AUTHENTICATED', null);

            newGameData.ownerId = userId;

            let [gErr, gRes] = await to(Games.create(newGameData));
            if (gErr) { console.log("error creating new game...."); return cb(gErr, null); }

            return cb(null, gRes);

        })(cb);
    }

    Games.remoteMethod('createNewGame', {
        http: { verb: 'post' },
        accepts: [
            { arg: 'newGameData', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
}