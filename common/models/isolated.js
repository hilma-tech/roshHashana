'use strict';

module.exports=function(Isolated){


Isolated.createNewIsolated = async (newIsolated) => {
    try {
       let res = await Isolated.create(newIsolated);
        return res;
    } catch (error) {
        console.log("Can`t do create new isolated"); 
       throw error;
    
    }
}


Isolated.remoteMethod('createNewIsolated', {
    http: { verb: 'post' },
    accepts: [
        { arg: 'newIsolated', type: 'object' }
    ],
    returns: { arg: 'res', type: 'object', root: true }
});



}
