'use strict';

module.exports = function(ShofarBlower) {



    ShofarBlower.createNewShofarBlower = async(newShofar,newShofarPub = null ) => {
        try {
            let Res = await ShofarBlower.create(newShofar);
                if(newShofarPub != null){                  
                    let ResShofarPub = await ShofarBlower.app.models.shofarBlowerPub.create(newShofarPub);
                    return {Res,ResShofarPub};
                } 
            return Res;         
    } catch (error) {
        if (error) { console.log("error creating new shofar...."); throw error }
    }



}

ShofarBlower.remoteMethod('createNewShofarBlower', {
    http: { verb: 'post' },
    accepts: [
        { arg: 'newShofar', type: 'object' },
        { arg: 'newShofarPub', type: 'object' }
    ],
    returns: { arg: 'res', type: 'object', root: true }
});








}