'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path=require('path');
const express=require('express');


var app = module.exports = loopback();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
require('./routes')(app);

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};


//app.get('/getModelsList',function(req,res){
//  res.send('hello from custom route');
//});
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
    
  if (require.main === module){

    app.start();

  }
});
