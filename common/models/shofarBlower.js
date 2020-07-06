'use strict';

module.exports = function(ShofarBlower) {



    ShofarBlower.createNewShofarBlower = async(newShofar) => {
        try {
            let Res = await ShofarBlower.create(newShofar);
        return Res;
    } catch (error) {
        if (error) { console.log("error creating new shofar...."); throw error }
    }



}

ShofarBlower.remoteMethod('createNewShofarBlower', {
    http: { verb: 'post' },
    accepts: [
        { arg: 'newShofar', type: 'object' }
    ],
    returns: { arg: 'res', type: 'object', root: true }
});








}