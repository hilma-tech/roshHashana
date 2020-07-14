'use strict';
var logUser = require('debug')('model:user');
let sendMsg = require('../../server/sendSms/SendSms.js')
const randomstring = require("randomstring");
let msgText = ` שלום `
let msgText2 = `הקוד שלך הוא:`
module.exports = function (CustomUser) {


CustomUser.createNewShofarBlower = async(name,phone,role) => {
    let resKey = await CustomUser.app.models.keys.createKey();
    try {
        let ResFindUser = await CustomUser.findOne({ where: { username:phone } })

        if(!ResFindUser) {
 
                let user= {
                    name:name,
                    username:phone,
                    keyId:resKey.id,
                };

            let ResCustom = await CustomUser.create(user);
            
            let roleMapping ={
                "principalType": "User",
                "principalId": ResCustom.id,
                "roleId": role
            }
           
            let ResRole = await CustomUser.app.models.RoleMapping.create(roleMapping);
            return ResCustom;         
             
            //  sendMsg(phone,`${msgText} ${name} /n ${msgText2} ${pincode}`)
          
        }else{

            let ResUpdateUser = await CustomUser.updateAll({ username : phone }, { keyId:resKey.id });
            return ResUpdateUser;
            // sendMsg(phone,`${msgText} ${name} /n ${msgText2} ${pincode}`)
           
        }

         
    } catch (error) {
        if (error) { console.log("error creating new shofar...."); throw error }
    }



}

CustomUser.authenticationKey = (key,options, res,cb ) => {

    CustomUser.app.models.keys.findOne({where:{key}},(err1,resKey)=>{
        if(err1){
            console.log("err",err1)
            cb( err1,null);
        }
        if (!resKey){
            console.log("key on")
           cb(null,{ok : false})
       }else {
        CustomUser.app.models.keys.destroyAll({where:{key}},(err2,resdelet)=>{
            if(err2){
                console.log("err",err2)
                cb( err2,null)
            }
        if(resdelet){
        CustomUser.findOne({where:{keyId : resKey.id}},(err, resUser) => {
            if (err) return cb(err, null);
            if (resUser) {
                CustomUser.directLoginAs(resUser.id,resUser.role,(err,result)=>{
                    let expires=new Date(Date.now()+5184000000);
                    res.cookie('access_token',result.__data.id, { signed: true, expires });
                    res.cookie('klo', result.__data.klo, { signed: false, expires });
                    res.cookie('kl', result.__data.kl, { signed: false, expires });
                // //These are all 'trash' cookies in order to confuse the hacker who tries to penetrate kl,klo cookies
                    res.cookie('kloo', randomstring.generate(), { signed: true, expires });
                    res.cookie('klk', randomstring.generate(), { signed: true, expires });
                    res.cookie('olk', randomstring.generate(), { signed: true, expires });
                    cb(null,{ok : true})},
                options ,5184000 )
            }
        })
        }})
       }
    })
}

CustomUser.remoteMethod('createNewShofarBlower', {
    http: { verb: 'post' },
    accepts: [
        { arg: 'name', type: 'string' },
        { arg: 'phone', type: 'string' },
        { arg: 'role', type: 'string' }
    ],
    returns: { arg: 'res', type: 'object', root: true }
});

CustomUser.remoteMethod('authenticationKey', {
    http: { verb: 'get' },
    accepts: [
        { arg: 'key', type: 'string' },
        { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        {arg:'res',type:'object',http:{source:'res'}}

    ],
    returns: { arg: 'res', type: 'string', root: true }
});
	
	
};