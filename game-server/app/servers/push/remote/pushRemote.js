'use strict';

module.exports = function(app) {
  return new PushRemote(app);

};
const PushRemote = function(app) {
  this.app = app;
  this.Notification = require('../../../vendor/notification')(app);
};
const prototype = PushRemote.prototype;

prototype.pushMessageOne = function(msg, cb) {
  if (!msg.content) msg.content = `[${msg.type}]`;
  this.Notification.createNotification(msg);
  cb();
};
