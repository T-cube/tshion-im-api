'use strict';

const crypto = require('crypto');
module.exports = function(app) {
  return new AccountRemote(app);
};

var AccountRemote = function(app) {
  this.app = app;
  this.roomMap = new Map();
};

const prototype = AccountRemote.prototype;

prototype.login = function(username, password, cb) {
  // use when need
  // let rpc = this.app.component.rpc;
  // rpc.route('/account/login', { username, password }, data => {
  //   if (data.status == 200) return cb(null, data.data);

  //   console.error(data);
  //   cb(data);
  // });
  cb(null, 'ok connected');
};


prototype.bindChannel = function(uid, cid, cb) {
  this.app.onlineRedis.set(uid, cid).then(status => {
    cb(null, status);
  }).catch(cb);
};

prototype.unbindChannel = function(uid, cb) {
  this.app.onlineRedis.del(uid).then(status => {
    cb(null, status);
  }).catch(cb);
};

prototype.bindRoom = function(from, target, cb) {
  const roomHash = crypto.createHash('sha1').update([from, target].sort().join('*')).digest('hex');
  cb(null, roomHash);
};

prototype.findFriends = function(uid) {

};

prototype.express = function(a, b, cb) {
  console.log('reveive:', a, b);
  cb(null, { a, b });
};
