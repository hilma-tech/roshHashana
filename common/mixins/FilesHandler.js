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
const FILE_TYPE_FILE = 'file';
const FILE_TYPE_IMAGE = 'image';

module.exports = function FilesHandler(Model) {

    Model.saveFile = async function (file, FileModel, ownerId = null, instanceId = null) {
        let saveDir = getSaveDir(file.type);
        let extension = getFileExtension(file.src);
        if (!extension) return false;
        let base64Data = file.src.replace(/^data:[a-z]+\/[a-z]+\d?;base64,/, "");

        // console.log("ownerId", ownerId);
        let fileObj = {
            category: file.category ? file.category : 'uploaded',
            owner: ownerId,
            format: extension,
            created: Date.now(),
            dontSave: true,// dont let afterSave remote do anything- needed?
            title: file.title
        };

        // If we are posting to and from the same model,
        // the instance was already created in the remote so we just update it 
        if (Model === FileModel)
            fileObj.id = instanceId;

        let specificSaveDir = saveDir + fileObj.category + "/";
        let [err, newFile] = await AsyncTools.to(FileModel.upsert(fileObj));
        if (err) { console.error("error creating file, aborting...", err); return false }

        if (!fs.existsSync(specificSaveDir)) {//create dir if dosent exist.
            fs.mkdirSync(specificSaveDir, { recursive: true });
        }
        fs.writeFileSync(specificSaveDir + newFile.id + "." + extension, base64Data, 'base64');

        // console.log("newFile.id", newFile.id)
        return newFile.id;
    }

    Model.beforeRemote('*', function (ctx, modelInstance, next) {
        // console.log("\nmixinss BEFORE REMOTE");
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT"/* && !modelInstance.id*/)
            return next()

        let args = ctx.args;
        let data, field, key;

        (async () => {
            const argsKeys = Object.keys(args);

            for (let i = 0; i < argsKeys.length; i++) { // we are not using map func, because we cannot put async inside it.
                field = argsKeys[i];
                if (field === "options") continue;
                data = args[field];
                if (typeof data !== "object" || !data || Array.isArray(data)) continue;
                const dataKeys = Object.keys(data);

                for (let j = 0; j < dataKeys.length; j++) { // we are not using map func, because we cannot put async inside it.
                    key = dataKeys[j];
                    if (typeof data[key] !== "object" || !data[key]) continue;

                    let filesToSave = ctx.args[field].myFiles || {};
                    filesToSave[key] = data[key];
                    ctx.args[field]["myFiles"] = filesToSave;
                    ctx.args[field][key] = null;
                };
            }
            return next();
        })();
    });

    Model.afterRemote('*', function (ctx, modelInstance, next) {
        // console.log("\nmixinss AFTER REMOTE");
        if (ctx.req.method !== "POST" && ctx.req.method !== "PUT" /*&& !modelInstance.id*/)
            return next()

        let args = ctx.args;

        (async () => {
            const argsKeys = Object.keys(args);

            for (let i = 0; i < argsKeys.length; i++) { // we are not using map func, because we cannot put async inside it.
                let field = argsKeys[i];
                if (field === "options") continue;
                if (!args[field] || !args[field].myFiles) return next();
                let filesToSave = args[field].myFiles;

                for (let fileKey in filesToSave) {
                    const file = filesToSave[fileKey];
                    if (typeof file !== "object") continue;
                    let ModelToSave = null;

                    switch (file.type) {
                        case FILE_TYPE_IMAGE:
                            ModelToSave = Model.app.models.Image;
                            break;
                        case FILE_TYPE_FILE:
                            ModelToSave = Model.app.models.Files;
                            break;
                        // TODO Shira ? - add Audio model and a case for it ?
                        default:
                            continue;
                    }

                    let fileOwnerId = (ctx.args.options && ctx.args.options.accessToken) ?
                        ctx.args.options.accessToken.userId : //if there's accessToken use userId
                        (Model === Model.app.models.CustomUser ? //else, if we are creating new user use new user's id
                            modelInstance.id :
                            null);

                    if (!fileOwnerId) { console.log("no owner id for file, aborting..."); continue; }
                    let newFileId = await Model.saveFile(file, ModelToSave, fileOwnerId, modelInstance.id);
                    if (!newFileId) { console.log("couldn't create your file dude, aborting..."); continue; }

                    // If we are posting to Files then it doesnt need the id of the file too
                    if (Model === ModelToSave) continue;

                    // TODO Shira - make sure that if [fileKey] doesnt exist in Model then dont upsert

                    // Updating the row to include the id of the file added
                    let [err, updatedField] = await AsyncTools.to(Model.upsert(
                        { id: fileOwnerId, [fileKey]: newFileId }
                    ));
                    if (err) { console.error("error updating field, aborting...", err); continue; }
                };
            }
            return next();
        })();
    });
}

function getSaveDir(type) {
    return path.join(__dirname, `../../public/${type}s/`);
}

function getFileExtension(fileSrc) {
    let mimeType = base64MimeType(fileSrc);
    if (!mimeType) return null;

    const mimeTypes = {
        //files
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        //images
        png: 'image/png',
        jpeg: 'image/jpeg', //jpeg & jpg
        gif: 'image/gif',
        //audio
        mp3: 'audio/mp3',
        wav: 'audio/wav'

    };

    return Object.keys(mimeTypes).find(key => mimeTypes[key] === mimeType);
}

function base64MimeType(encoded) {
    if (typeof encoded !== 'string') return null;

    var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    if (mime && mime.length) return mime[1];
    return null;
}
