'use strict';

var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
var fs = require('fs');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo');

const config = require('./config/config');

const co = require('co');
co(function*() {
  const { ObjectID, db } = yield require('./libs/mongodb')(config.mongodb);

  app.set('ObjectID', ObjectID, true);
  app.set('db', db, true);

  require('./libs/redis')(app, config.redis);
  app.set('roomMap', new Map(), true);
  app.set('chatMap', new Map(), true);
  // app configure
  app.configure('production|development', function() {
    // route configures
    app.route('chat', routeUtil.chat);
    app.set('connectorConfig', {
      connector: pomelo.connectors.sioconnector,
      // 'websocket', 'polling-xhr', 'polling-jsonp', 'polling'
      transports: ['websocket', 'polling'],
      heartbeats: true,
      closeTimeout: 60 * 1000,
      heartbeatTimeout: 60 * 1000,
      heartbeatInterval: 25 * 1000,
    });
    // filter configures
    app.filter(pomelo.timeout());
  });

  app.set('errorHandler', require('./libs/error.handler'));

  // add express server component
  if (app.getServerType() == 'express') {
    var exp = require('./app/components/expressproxy');
    app.load('expressproxy', exp(app));
  }

  if (app.getServerType() == 'rpc') {
    var rpc = require('./app/components/rpcproxy');
    app.load('rpc', rpc(app, config.rpc));
  }

  // start app
  app.start(function() {
    let channelService = app.get('channelService');
    if (channelService) {
      // 此处是脏代码
      channelService.constructor.prototype.getChannel = function(name, create) {
        let channel = this.channels[name];
        if (!channel && !!create) {
          channel = this.channels[name] = this.createChannel(name, this);
          channel.loginMap = new Map();
        }
        return channel;
      };
    }
    // console.log(app.get('channelService').constructor);
    // console.info('                     _oo0oo_');
    // console.info('                    088888880');
    // console.info('                    88" . "88');
    // console.info('                    (| -_- |)');
    // console.info('                     0\\ = /0');
    // console.info('                  ___/\'---\'\\___');
    // console.info('                .\' \\\\|     |// \'.');
    // console.info('               / \\\\|||  :  |||// \\');
    // console.info('              /_ ||||| -:- |||||- \\');
    // console.info('             |   | \\\\\\  -  /// |   |');
    // console.info('             | \\_|  \'\'\\---/\'\'  |_/ |');
    // console.info('             \\  .-\\__  \'-\'  __/-.  /');
    // console.info('           ___\'. .\'  /--.--\\  \'. .\'___');
    // console.info('        ."" \'<  \'.___\\_<|>_/___.\' >\'  "".');
    // console.info('       | | : \'-  \\\'.;\'\\ _ /\';.\'/ - \' : | |');
    // console.info('       \\  \\ \'_.   \\_ __\\ /__ _/   .-\' /  /');
    // console.info('   =====\'-.____\'.___ \\_____/___.-\'____.-\'=====');
    // console.info('                     \'=---=\'');
    // console.info('');
    // console.info(' ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    // console.info('       Buddha bless    : :    Never BUGs');
  });

}).catch(e => {
  throw e;
});




process.on('uncaughtException', function(err) {
  console.error(' Caught exception: ' + err.stack);
});