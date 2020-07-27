'use strict';

//Modules auto loader, prebuild process (there's also a post build process on boot/modules-loader.js)

require('../scripts/prebuild');
require('dotenv').config();
const cors = require('cors');
var loopback = require('loopback');
var boot = require('loopback-boot');
var path=require('path');
const express=require('express');

var app = module.exports = loopback();
app.use(express.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../build'));
// require('./routes')(app);

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

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

boot(app, __dirname, function(err) {
  if (err) throw err;

  app.use(express.static(__dirname + '../build'));  
    
  if (require.main === module){

    app.start();

  }
});
