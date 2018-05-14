'use strict';

var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo');

const config = require('./config/config');

const co = require('co');
co(function*() {
  const [{ ObjectID, db }] = yield require('./libs/mongodb')(config);

  app.set('ObjectID', ObjectID, true);
  app.set('db', db, true);

  const mysql = require('./libs/mysql');
  const tlf2_db = new mysql(config);
  app.set('tlf2_db', tlf2_db, true);

  require('./libs/redis')(app, config.redis);
  app.set('roomMap', new Map(), true);
  app.set('chatMap', new Map(), true);
  // app configure
  app.configure('production|development', function() {
    // route configures
    app.route('chat', routeUtil.chat);
    app.set('connectorConfig', {
      connector: pomelo.connectors.hybridconnector,
      // 'websocket', 'polling-xhr', 'polling-jsonp', 'polling'
      transports: ['websocket','polling-xhr', 'polling',],
      // transports: ['polling-xhr','websocket', 'polling',],
      // useProtobuf: true,
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
    exp(app);
    // app.load('expressproxy', exp(app));
  }

  // if (app.getServerType() == 'rpc') {
  //   var rpc = require('./app/components/rpcproxy');
  //   app.load('rpc', rpc(app, config.rpc));
  // }

  // start app
  app.start(require('../shared/fixChannelMap')(app));

}).catch(e => {
  console.error(app.getServerType());
  throw e;
});


process.on('uncaughtException', function(err) {
  console.error('Caught exception: ' + err.stack);
});
