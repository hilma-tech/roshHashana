'use strict';
const path = require('path');
const AsyncTools = {
    to(promise) {
        return promise.then(data => {
            return [null, data];
        })
            .catch(err => [err]);
    }
}
const fs = require('fs');
const encodedFileContainer = 'images';

const saveDir = path.join(__dirname, '../../public/images/uploaded/')

module.exports = function saveForm(Model, options) {

    Model.beforeRemote('*', function (ctx, modelInstance, next) {

        console.log("typeof next?", typeof next);
        // return next();

        //todo:
        //security
        //for post only.

        let dataInArgs = ctx.args;
        let ImageModel = Model.app.models.Image;
        let data;
        (async () => {
            Object.keys(dataInArgs).map((field) => {
                if (field != "options") {
                    data = dataInArgs[field];
                    Object.keys(data).map(async (key) => {
                        if (typeof data[key] == "object" && data[key].fieldType == "image") {
                            let typeData = base64MimeType(data[key].imgSrc);
                            if (typeData) {
                                let FileData = typeData.split('/');
                                if (FileData[0] == "image") {
                                    let extention = typeData.split('/')[1];
                                    let base64Data = data[key].imgSrc.replace(/^data:image\/[a-z]+;base64,/, "");

                                    let imgObj = {
                                        imageCategory: 'uploaded',
                                        owner: ctx.args.options.accessToken ? ctx.args.options.accessToken.userId : null,
                                        imageFormat: extention,
                                        created: Date.now(),
                                        dontSave: true,// dont let afterSave remote do anything
                                        title: data.title
                                    };

                                    let [err, newImage] = await AsyncTools.to(ImageModel.create(imgObj));

                                    fs.writeFileSync(saveDir + newImage.id + "." + FileData[1], base64Data, 'base64');

                                    ctx.args[field][key] = newImage.id;

                                }
                            }
                        }
                    });


                }
            })
            return next();
        })()

    });



    // Helper method which takes the request object and returns a promise with a file.


}



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


            // content.charAt(0)
            //  '/' : jpg

            //  'i' : png

            //  'R' : gif

            //  'U' : webp



            //ng-src