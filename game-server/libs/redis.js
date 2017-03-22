'use strict';
const promiseRedis = require('promise-redis')();

module.exports = function(app, config) {
  Array.prototype.map.call(config, cfg => {
    let client = promiseRedis.createClient(cfg);
    app.set(`${cfg.prefix}Redis`, client, true);
    console.log(`add redis ${cfg.prefix}`);
  });
};
