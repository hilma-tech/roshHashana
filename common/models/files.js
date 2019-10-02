
var fs = require('fs');
var path = require('path');
var logFile = require('debug')('model:file');
const https = require('https');

const FILES_DIR = 'public/files/';

module.exports = function (File) {
    File.observe('loaded', function (ctx, next) {

        var fData;
        if (ctx.instance) {    //for first upload
            //  logImage("CTX.instance exists",ctx);
            fData = ctx.instance;
        }
        else {
            // logImage("CTX.instance does not exist",ctx);
            fData = ctx.data;
            fData.path = `/files/${fData.category}/${fData.id}.${fData.format}`;
        };
        ctx.data = fData;
        next();
    });


    File.observe('before save', function (ctx, next) {
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
        else console.log("No owner for this file.")
        next();
    });


    File.observe('after save', function (ctx, next) { //call next, dont forget!!
        logFile("after dave");
        var fData;
        if (ctx.instance) {    //for first upload
            //console.log("CTX.instance exists",ctx);
            fData = ctx.instance;
            logFile("fdata", fData);
        }
        else {
            //console.log("CTX.instance does not exist",ctx);
            fData = ctx.data;
            logFile("fdata", fData);
        };
        // console.log("fData", fData);

        if (fData.dontSave)// if we dont want the remote to work.
            return next();

        //only if there is new file upload event
        if (fData.fileName && path.extname(fData.fileName)) {
            fData.fileBasename = path.basename(fData.fileName);
            fData.extention = path.extname(fData.fileName);

            var storagePath = path.join(__dirname, '../', '../', 'server/storage/container');
            var srcPath = storagePath + "/" + fData.fileName;
            //    fData.category='sages';        

            var savDir = path.join(__dirname, '../', '../', FILES_DIR);

            var distPath =
                savDir + "/" + fData.id + fData.extention;

            //chehck if file exists
            logFile("src dist", srcPath, distPath);

            if (fs.existsSync(srcPath)) {
                logFile("file exist!")
                fData.fileName = fData.id;
                if (!fs.existsSync(savDir)) {
                    logFile("no dir");
                    fs.mkdirSync(savDir, { recursive: true }, (error) => {
                        if (error) {
                            logFile("Error while mkdir:", error)
                            throw error;
                        }
                        logFile("creating dir ", savDir);
                        fs.createReadStream(srcPath).pipe(fs.createWriteStream(distPath).on('end', function () {
                            logFile("done writing file.");
                            return next();
                        }));
                    });
                }
                else {
                    logFile("folder exists.");
                    return fs.createReadStream(srcPath).pipe(fs.createWriteStream(distPath).on('close', function () {
                        logFile("done writing file.");
                        return next();
                    }));
                }
            } else {
                logFile("file was not uploaded")
                return next();
                //general after save is called when personal after saves are done
                //File.beforeSaveProcess(ctx,next);
            }
        } else {
            //for regular upsert
            if (fData.fileName) {
                fData.fileName = path.basename(fData.fileName);
            }
            next();
            //general after save is called when personal after saves are done
            //File.beforeSaveProcess(ctx,next);
        }
    });


    /** 
    This function gets url and data of online file, and copies this file to our server.
    It also register this file to File table.
    **/
    File.downloadToServer = function (data, options, cb) {
        let saveDir = path.join(__dirname, '../', '../', FILES_DIR);
        let extention = path.extname(data.url).substr(1);
        console.log("data!!", data)
        let fileObj = {
            owner: options.accessToken ? options.accessToken.userId : null,
            format: extention,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything
            title: data.title
        };
        File.create(fileObj, (err, res) => {
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

    File.remoteMethod('downloadToServer', {
        http: {
            verb: 'post'
        },
        accepts: [
            { arg: 'data', type: 'object' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'res', type: 'object', root: true }
    });

};
