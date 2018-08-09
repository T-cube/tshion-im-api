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
  const [{ ObjectID, db }, tlf_db] = yield require('./libs/mongodb')(config);

  app.set('ObjectID', ObjectID, true);
  app.set('db', db, true);
  app.set('tlf_db', tlf_db, true);

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
      transports: ['websocket', 'polling-xhr', 'polling', ],
      // transports: ['polling-xhr','websocket', 'polling',],
      useProtobuf: true,
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
  app.start(require('../shared/fixChannelMap')(app));

}).catch(e => {
  throw e;
});

process.on('uncaughtException', function(err) {
  console.error('Caught exception: ' + err.stack);
});
