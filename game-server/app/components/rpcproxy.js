'use strict';

const rpc = require('@ym/rpc');
const http = require('http');

module.exports = function(app, config) {
  const server = http.createServer();
  rpc.install(server, config);

  let rpcMap = new Map();
  rpc.on('connect', data => {
    let { appid, handleSocket } = data;
    rpcMap.set(appid, handleSocket);
    app.set(`${appid}-rpc`, handleSocket);

    require('./rpc')(appid, handleSocket, app);
  });
  server.listen(config.port || 2001, config.host || '127.0.0.1');
};
