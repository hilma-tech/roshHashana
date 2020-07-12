'use strict';


module.exports = function (keys) {


//create new key that does not exist
keys.createKey = async () => {
    let key = Math.floor(Math.random() * 9000) + 1000;
    try {
       let resKeys = await keys.find({fields:["key"]}); 
       for (let i = 0; i < resKeys.length; i++) {
           if(resKeys[i].key === key){
                key = Math.floor(Math.random() * 9000) + 1000;
                i=0;
           }
       }
       let resKey= await keys.create({ key : key , dateKey: new Date()});
       if(resKey) return resKey.id;
       
    } catch (error) {
        if (error) { console.log("error creating new shofar...."); throw error }
    }

}



}