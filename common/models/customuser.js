'use strict';

var logUser = require('debug')('model:user');
let sendMsg = require('../../server/sendSms/SendSms.js')
let msgText = ` שלום `
let msgText2 = `הקוד שלך הוא:`
module.exports = function (CustomUser) {


CustomUser.createNewShofarBlower = async(name,phone,role) => {
    let keyId = await CustomUser.app.models.keys.createKey();
    try {
        let ResFindUser = await CustomUser.findOne({ where: { username:phone } })

        if(!ResFindUser) {
 
                let user= {
                    firstName:name,
                    username:phone,
                    keyId:keyId,
                    roleId: role
                };

            let ResCustom = await CustomUser.create(user);
            
            let roleMapping ={
                "principalType": "User",
                "principalId": ResCustom.id,
                "roleId": role
            }
           
            let ResRole = await CustomUser.app.models.RoleMapping.create(roleMapping);
            return ResCustom;         
             
             sendMsg(phone,`${msgText} ${name} /n ${msgText2} ${pincode}`)
          
        }else{

            let ResUpdateUser = await CustomUser.updateAll({ username : phone }, { keyId:keyId });
            return ResUpdateUser;
            sendMsg(phone,`${msgText} ${name} /n ${msgText2} ${pincode}`)
           
        }

         
    } catch (error) {
        if (error) { console.log("error creating new shofar...."); throw error }
    }



    


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

	
	
};