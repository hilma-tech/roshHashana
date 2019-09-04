const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require('path')

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



    ///////// GETS THE FORM/TABLE DATA ////////
    app.get('/api/meta/:type/:model', function (req, res) {
        let params = req.params.model.charAt(0).toUpperCase() + req.params.model.slice(1);;
        let Model = app.models[params];

        const modelMeta = fs.readFileSync('common/models/' + req.params.model + ".json", 'utf-8');
        const modelMetaJson = JSON.parse(modelMeta).crud;
        if (req.params.type === "form") {
            res.send(JSON.stringify(modelMetaJson));
        } else if (req.params.type === "table") {
            let fields = {};
            Object.keys(modelMetaJson.fields).map(e => (fields[e] = true));
            Model.find({ fields: fields }, function (err, tableData) {

                if (err) console.log(err)
                else {
                    let table = {
                        fields: modelMetaJson.fields,
                        data: tableData,
                        tableActions: modelMetaJson.tableActions ? modelMetaJson.tableActions: null
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(table));
                }
            });
        } else res.send("ERROR: You can only get table data or form data. change params accordinly")
    });

}
