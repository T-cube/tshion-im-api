'use strict';
const rpc = require('ym-rpc');
module.exports = function(app) {
  const Remote = new TlifangRemote(app);
  return Remote;
};

const TlifangRemote = function(app) {
  let self = this;

  self.app = app;
  rpc.register(require('../../../../config/config').rpc.register).then(clientRpc => {
    console.log('client tim rpc connect success');
    self.clientTim = clientRpc;
    app.set('clientTim', clientRpc);
  }).catch(e => console.error(e, 123));
};

var prototype = TlifangRemote.prototype;

prototype.login = function(token, cb) {
  let self = this;

  self.clientTim.route('/account/login', { token }, data => {
    if (data.code == 200) return cb(null, data.data);

    console.error(data);
    cb(data);
  });
};
