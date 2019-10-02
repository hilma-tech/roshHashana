const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require('path')

module.exports = function (app) {

    ///////// GETS THE FORM/TABLE DATA WITH RELATIONS ////////
    app.get('/api/meta/:type/:model', function (req, res) {
        const modelMeta = fs.readFileSync('common/models/' + req.params.model + ".json", 'utf-8');
        const modelMetaJson = JSON.parse(modelMeta).crud;
        const modelRelations = JSON.parse(modelMeta).options.relations || JSON.parse(modelMeta).relations;
        const modelInfo = { fields: modelMetaJson.fields, relations: modelRelations };
        let params = JSON.parse(modelMeta).name;
        console.log("params", params);
        let Model = app.models[params];

        if (req.params.type === "form") {
            res.send(JSON.stringify(modelInfo));
        } else if (req.params.type === "table") {
            let fields = {};
            let relations = [];
            Object.keys(modelMetaJson.fields).map(e => (fields[e] = true));
            Object.keys(modelRelations).map(r => (relations.push(r)));
            // console.log(req.query.filter, "req.query.filter");
            let filter = req.query.filter ? JSON.parse(req.query.filter) : {};
            filter.include ? filter.include = filter.include + " " + relations : filter.include = relations;
            filter.fields ? filter.fields = filter.fields + " " + fields : filter.fields = fields;
            Model.find(
                filter
                , function (err, tableData) {
                    if (err) console.log(err)
                    else {
                        let table = {
                            data: tableData,
                            fields: modelMetaJson.fields,
                            relations: modelRelations,
                            tableActions: modelMetaJson.tableActions ? modelMetaJson.tableActions : null
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.send(JSON.stringify(table));
                    }
                });
        } else res.send("ERROR: You can only get table data or form data. change params accordinly")
    });
}
