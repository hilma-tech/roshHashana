const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);


module.exports = function (app) {

    app.get('/api/get-models-list', function (req, res) {

        async function readModels(cb) {

            let list = {};
            let exposeit = [];

            try {
                const configJson = await readFile('server/model-config.json', 'utf-8');
                list = JSON.parse(configJson);

                let keys = Object.keys(list);
                exposeit = keys.filter(function (key) {
                    if (list[key].expose === true) {
                        return true;
                    } else { return false; }
                });
                //esposeit console.log us the models name that the model.config.expose == true.

            } catch (err) {
                cb({});
            }
            cb(exposeit);


        }

        readModels((exposeit) => {

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(exposeit));

        });

    });
}