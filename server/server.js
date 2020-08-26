'use strict';

//Modules auto loader, prebuild process (there's also a post build process on boot/modules-loader.js)

require('../scripts/prebuild');
require('dotenv').config();
const cors = require('cors');
var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
const express = require('express');

var app = module.exports = loopback();
app.use(express.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../build'));
// require('./routes')(app);

app.start = function () {
  // start the web server
  return app.listen(function () {
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

boot(app, __dirname, function (err) {
  if (err) throw err;

  app.use(express.static(__dirname + '../build'));
  app.use(loopback.static(__dirname + '../build/index.html'));

  if (require.main === module) {

    // OPTIONS for socket: you can add { transports: ["websocket", "xhr-polling"] };
    // this means you'll be using websocket instead of polling (recommended);
    // NOTE you need to have the same transports in the client too;
    const options = { transports: ["websocket", "xhr-polling"] }; // ! Not required !
    // you can read more about the options here: https://socket.io/docs/server-api/

    // Here we need to add the Socket to our server, like so: require('socket.io')(SERVER, OPTIONS);
    // in loopback's case the SERVER is app.start();
    const io = require("@hilma/socket.io-server").default(
      app.start(),
      options
    );

    // now here we can do the usual io.on('connection' socket => { ... });

    // setting this means that you can use the io instance anywhere you use app;
    app.io = io;

  }
});
