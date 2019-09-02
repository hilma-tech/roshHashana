const promisify = require('util').promisify;
const fs = require('fs');
const readFile = promisify(fs.readFile);
const path = require('path')

function base64MimeType(encoded) {
    var result = null;

    if (typeof encoded !== 'string') {
        return result;
    }

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

    if (mime && mime.length) {
        result = mime[1];
    }

    return result;
}
const saveDir = path.join(__dirname, '../../public/images/uploaded/')

const AsyncTools = {
    to(promise) {
        return promise.then(data => {
            return [null, data];
        })
            .catch(err => [err]);
    }
}
module.exports = function (app) {


    app.post('/api/*', (req, res, next) => {
        let data = req.body;
        if (req.body.form) {
            data = data.form;
        }

        let ImageModel = app.models.Image;

        (async () => {
            // console.log("data form", data)
            Object.keys(data).map(async (key) => {
                if (typeof data[key] == "object" && data[key].fieldType == "image") {
                    console.log("~~~~~~~~saveing gile~~~~~~~~~~``")

                    let typeData = base64MimeType(data[key].imgSrc);
                    if (typeData) {
                        let FileData = typeData.split('/');
                        if (FileData[0] == "image") {
                            console.log("~~~~~~~~saveing gile~~~~~~~~~~``")
                            let extention = typeData.split('/')[1];
                            let base64Data = data[key].imgSrc.replace(/^data:image\/[a-z]+;base64,/, "");

                            let imgObj = {
                                imageCategory: 'uploaded',
                                owner: null,//TODO urgent
                                imageFormat: extention,
                                created: Date.now(),
                                dontSave: true,// dont let afterSave remote do anything
                                title: data.title
                            };

                            let [err, newImage] = await AsyncTools.to(ImageModel.create(imgObj));

                            fs.writeFileSync(saveDir + newImage.id + "." + FileData[1], base64Data, 'base64');
                            // ctx.instance.form = {
                            //     key: newImage.id
                            // }
                            data[key] = newImage.id;

                            // [key] = newImage.id;
                        }
                    }

                }
            })
            if (req.body.form)
                req.body.form = data;
            else req.body = data;
            return next();
        })()

    });


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
                        data: tableData
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(table));
                }
            });
        } else res.send("ERROR: You can only get table data or form data. change params accordinly")
    });

}