'use strict';

const fs = require('fs');
//var ds = require('../data-sources/db.js')('oracle');

module.exports = function(server) {
  
  var router = server.loopback.Router();
  router.get('/api/meta/:model', function (req, res) {
    //console.log("get meta for model ",req.params.model);
    const modelMeta = fs.readFileSync('common/models/'+req.params.model+".json", 'utf-8');
    //console.log("modelMeta",modelMeta);
    const modelMetaJson = JSON.parse(modelMeta);
    //console.log("modelMetaJson",modelMetaJson);
    res.json(modelMetaJson);
  });
  server.use(router);

/*
var TWO_WEEKS = 60 * 60 * 24 * 7 * 2;
server.models.User.login({
  email: 'eran.gep@gmail.com',           // must provide email or "username"
  password: 'E2PSzAmJ-5-ldKnl',               // required by default
  ttl: TWO_WEEKS                    // keep the AccessToken alive for at least two weeks
}, function (err, accessToken) {
  
  if (err){
    console.log("login err",err);
    return;
  }
  
  console.log("accessToken",accessToken);
  
  console.log(accessToken.id);      // => GOkZRwg... the access token
  console.log(accessToken.ttl);     // => 1209600 time to live
  console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z
  console.log(accessToken.userId);  // => 1
});
*/

};
