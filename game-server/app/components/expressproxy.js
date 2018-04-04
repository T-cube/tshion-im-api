'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const oauthServer = require('oauth2-server');
const connectMultiparty = require('connect-multiparty');

const apiError = require('../express-proxy/libs/api-error');

module.exports = function(app, opts) {
  opts = opts || {};
  return new ExpressProxy(app, opts);
};

var ExpressProxy = function(app, opts) {
  this.opts = opts;
  this.exp = express();
  this.app = app;

  // body-parser
  this.exp.use(bodyParser.urlencoded({
    'extended': true
  }));

  this.exp.use(connectMultiparty({
    maxFilesSize: 15240000
  }));

  this.exp.use(bodyParser.json());
  this.exp.use(bodyParser.text({
    'defaultCharset': 'utf-8'
  }));

  const cors = require('cors');

  const whitelist = ['http://cp.tlf.michael.local', 'https://cp.tlifang.com', 'https://cpapi.tlifang.com/oauth/token', 'http://cp.tlifang.com'];
  let corsOptionsDelegate = function(url, callback) {
    // console.log('>>>>>>>>>>>>>>>:', url);
    let corsOptions;
    if (whitelist.indexOf(url) !== -1) {
      corsOptions = {
        origin: true
      }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = {
        origin: false
      }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };
  this.exp.use(cors({
    origin: corsOptionsDelegate
  }));

  this.exp.use(function(req, res, next) {
    req.apiError = apiError;
    next();
  });

  // oauth model user
  this.exp.use('/api*', require('../express-proxy/middleware/oauth-check')());
  this.exp.oauth = oauthServer({
    model: require('../../libs/oauth-model')(app),
    grants: ['password', 'refresh_token', 'authorization_code'],
    debug: false,
    accessTokenLifetime: 1800,
    refreshTokenLifetime: 3600 * 24 * 15,
    continueAfterResponse: true,
  });


  // add app to req
  this.exp.use(function(req, res, next) {
    req.pomelo = app;
    next();
  });

  let self = this;
  require('../express-proxy/route')(this.exp, this.app);
  // router
  this.exp.all('/api/123', function(req, res) {
    console.log(req.body, '..........................1111', console.log(req.user));
    // self.app.rpc.account.accountRemote.express(null, 1, 2, function(err, data) {
    //   res.json(data);
    // });
    res.json({ name: 123 });
  });

  // oauth error handler
  this.exp.use(this.exp.oauth.errorHandler());


  /**
   * error handler
   */
  this.exp.use(function(err, req, res, next) {

  });

  this.start(function() {
    console.log('express started');
  });
};

var pro = ExpressProxy.prototype;

pro.name = '__ExpressProxy__';

pro.start = function(cb) {
  if (this.exp) {
    this.exp.listen(9999);
    process.nextTick(cb);
  }
};

pro.afterStart = function(cb) {
  process.nextTick(cb);
};

pro.stop = function(force, cb) {
  process.nextTick(cb);
};

var test = function(req, res, next) {};
