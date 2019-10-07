'use strict';
module.exports = function () {
    //4XX - URLs not found
    return function customRaiseUrlNotFoundError(req, res, next) {
        
        res.render('index');
        //next();
        //res.send("<h1>404</h1>");
        //res.sendFile('index.html');
        //res.sendFile('path to 404.html', function (err) {
        //    if (err) {
        //        console.error(err);
        //        res.status(err.status).end();
        //    }
        //});
    };
};