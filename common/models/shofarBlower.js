'use strict';

module.exports = function(ShofarBlower) {
    //role = 2

// {
// "can_blow_x_times":1,
//             "volunteering_start_time":1594563291554,
//             "volunteering_end_time":1594563291554,
//         "city" : "חיפה",
//         "street": "פרויד",
//         "appartment": "23",
//         "comments": null
//     }
   ShofarBlower.InsertDataShofarBlower = async (data,options) => {
       
       
       let objToBlower = {
            "userBlowerId":options.accessToken.userId,
            "can_blow_x_times":data.can_blow_x_times,
            "volunteering_start_time":data.volunteering_start_time,
            "volunteering_end_time":data.volunteering_end_time
        },
        objToCU={
            "city" : data.city,
            "street": data.street,
            "appartment": data.appartment,
            "comments": data.comments    
        };
       
       
       try {
           let resRole = await ShofarBlower.app.models.RoleMapping.findOne({where:{principalId : options.accessToken.userId }});
           if (resRole.roleId === 2){
                let resBlower = await ShofarBlower.create(objToBlower)
                let resCU = await ShofarBlower.app.models.CustomUser.updateAll({id : options.accessToken.userId }, objToCU);
                return {ok : true};
           }else{
               return {ok : false, err:"No permissions"};
           }
           

       } catch (error) {
        console.log("Can`t do create new isolated",error); 
       throw error;
       }

   }




ShofarBlower.remoteMethod('InsertDataShofarBlower', {
    http: { verb: 'post' },
    accepts: [
      { arg: 'data', type: 'object' },
      { arg: 'options', type: 'object', http: "optionsFromRequest" }
    ],
    returns: { arg: 'res', type: 'object', root: true }
});


}