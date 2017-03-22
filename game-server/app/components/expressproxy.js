'use strict';
const express = require('express');
const bodyParser = require('body-parser');

module.exports = function(app, opts) {
  opts = opts || {};
  return new ExpressProxy(app, opts);
};

var ExpressProxy = function(app, opts) {
  this.opts = opts;
  this.exp = express();

  // body-parser
  this.exp.use(bodyParser.urlencoded({
    'extended': true
  }));
  this.exp.use(bodyParser.json());
  this.exp.use(bodyParser.text({
    'defaultCharset': 'utf-8'
  }));


  // add app to req
  this.exp.use(function(req, res, next) {
    req.pomelo = app;
    next();
  });

  require('../express-proxy/route')(this.exp, app);
  // router
  this.exp.get('/', function(req, res) {
    app.rpc.account.accountRemote.express(null, 1, 2, function(err, data) {
      res.json(data);
    });
  });
};

var pro = ExpressProxy.prototype;

pro.name = '__ExpressProxy__';

pro.start = function(cb) {
  this.exp.listen(9999);
  process.nextTick(cb);
};

pro.afterStart = function(cb) {
  process.nextTick(cb);
};

pro.stop = function(force, cb) {
  process.nextTick(cb);
};

var test = function(req, res, next) {};
