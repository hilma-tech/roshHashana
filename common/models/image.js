
var fs = require('fs');
var path = require('path');
var logImage = require('debug')('model:image');
const https = require('https');

const IMAGES_DIR = 'public/images/';
module.exports = function (Image) {


    Image.observe('loaded', function (ctx, next) {

        var fData;
        if (ctx.instance) {    //for first upload
            //  logImage("CTX.instance exists",ctx);
            fData = ctx.instance;
        }
        else {
            // logImage("CTX.instance does not exist",ctx);
            fData = ctx.data;
            fData.path = `/images/${fData.imageCategory || undefined}/${fData.id}.${fData.imageFormat}`;
        };
        ctx.data = fData;
        next();
    });


    Image.observe('before save', function (ctx, next) {
        // if no owner specified, mark uploader as owner.
        if (ctx.options.accessToken) {
            if (ctx.instance) {
                if (!ctx.instance.owner)
                    ctx.instance.owner = ctx.options.accessToken.userId;
            }
            else if (!ctx.data.owner) {
                ctx.data.owner = ctx.options.accessToken.userId;
            };
        }
        else console.log("No owner for this image.")
        next();
    });


    Image.observe('after save', function (ctx, next) { //call next, dont forget!!
        logImage("after dave");
        var fData;
        if (ctx.instance) {    //for first upload
            //  logImage("CTX.instance exists",ctx);
            fData = ctx.instance;
            logImage("fdata", fData);
        }
        else {
            // logImage("CTX.instance does not exist",ctx);
            fData = ctx.data;
            logImage("fdata", fData);
        };
        console.log("fData", fData);

        if (fData.dontSave)// if we dont want the remote to work.
            return next();

        //only if there is new image upload event
        if (fData.fileName && path.extname(fData.fileName)) {
            fData.fileBasename = path.basename(fData.fileName);
            fData.extention = path.extname(fData.fileName);

            var storagePath = path.join(__dirname, '../', '../', 'server/storage/container');
            var srcPath = storagePath + "/" + fData.fileName;
            //    fData.category='sages';        

            var savDir = path.join(__dirname, '../', '../', IMAGES_DIR + fData.imageCategory);

            var distPath =
                savDir + "/" + fData.id + fData.extention;

            //chehck if file exists
            logImage("src dist", srcPath, distPath);

            if (fs.existsSync(srcPath)) {
                logImage("file exist!")
                fData.fileName = fData.id;
                if (!fs.existsSync(savDir)) {
                    logImage("no dir");
                    fs.mkdirSync(savDir, { recursive: true }, (error) => {
                        if (error) {
                            logImage("Error while mkdir:", error)
                            throw error;
                        }
                        logImage("creating dir ", savDir);
                        fs.createReadStream(srcPath).pipe(fs.createWriteStream(distPath).on('end', function () {
                            logImage("done writing file.");
                            return next();
                        }));
                    });
                }
                else {
                    logImage("folder exists");
                    return fs.createReadStream(srcPath).pipe(fs.createWriteStream(distPath).on('close', function () {
                        logImage("done writing file.");
                        return next();
                    }));
                }
            } else {
                logImage("file was not uploaded")
                return next();
                //general after save is called when personal after saves are done
                //Image.beforeSaveProcess(ctx,next);
            }
        } else {
            //for regular upsert
            if (fData.fileName) {
                fData.fileName = path.basename(fData.fileName);
            }
            next();
            //general after save is called when personal after saves are done
            //Image.beforeSaveProcess(ctx,next);
        }
    });


    /** 
    This function gets url and data of online image, and copies this image to our server.
    It also register this image to Image table.
    **/
    Image.downloadToServer = function (data, options, cb) {
        let saveDir = path.join(__dirname, '../', '../', IMAGES_DIR, data.category);
        let extention = path.extname(data.url).substr(1);
        console.log("data!!", data)
        let imgObj = {
            imageCategory: data.category,
            owner: options.accessToken ? options.accessToken.userId : null,
            imageFormat: extention,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything
            title: data.title
        };
        Image.create(imgObj, (err, res) => {
            if (err) {
                console.log("error on create record!", err);
                return cb(err.message);
            }
            let saveFile = path.join(saveDir, `/${res.id}.${extention}`);
            if (!fs.existsSync(saveDir))
                fs.mkdirSync(saveDir, { recursive: true });
            var file = fs.createWriteStream(saveFile);
            https.get(data.url, function (response) {
                try {
                    response.pipe(file);
                    return cb(null, res);
                }
                catch (error) {
                    console.error("ERROR", error.message);
                    return cb(error.message);
                }
            });
        });
    };

    Image.getUsersImages = function (filter, options, cb) {
        try {
            let userId = options.accessToken.userId;
            filter = filter ? JSON.parse(filter) : {};
            return Image.find({ where: { owner: userId }, ...filter }, options, (err, res) => {
                if (err) return cb(err)
                res.forEach(image => {
                    image.owner = null; `   `
                });
                return cb(null, res);
            });
        }
        catch (err) {
            return cb(null, []); //no userid return empty
        }
    }

    Image.remoteMethod('downloadToServer', {
        http: {
            verb: 'post'
        },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

    Image.remoteMethod('getUsersImages', {
        http: {
            verb: 'get'
        },
        description: "***REMOTE*** filter images to user",
        accepts: [
            { arg: 'filter', type: 'string' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });
};





// ~~~~ EXAMPLE OF USAGE ~~~~ 

// Model.saveImage = function (form, cb) {
//     console.log("image-id", form.profile_image);
//     cb(null, { success: 1 });
// }

// Model.remoteMethod('saveImage', {
//     verb: "post",
//     accepts: [
//         { arg: 'form', type: 'object' },
//     ],
//     returns: { arg: 'res', type: 'object', root: true },
//     description: "check."
// });