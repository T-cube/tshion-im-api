'use strict';

const crypto = require('crypto');
module.exports = function(app) {
  return new AccountRemote(app);
};

var AccountRemote = function(app) {
  this.app = app;
  this.roomMap = new Map();
  this.channelService = app.get('channelService');
};

const prototype = AccountRemote.prototype;

prototype.login = function(token, cb) {
  // use when need
  console.log(this.app.get('hello'));
  this.app.rpc.tlifang.tlifangRemote.login(null, token, function(err, data) {
    if (err) return cb(err);
    cb(null, data);
  });
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