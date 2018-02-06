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
  if (!msg.content) {
    let content;
    switch (msg.type) {
    case 'audio':
      content = '新语音';
      break;
    case 'image':
      content = '新图片消息';
      break;
    case 'file':
      content = '新文件';
      break;
    default:
      content = '新消息';
    }
    msg.content = `[${content}]`;
  }
  this.Notification.createNotification(msg);
  cb();
};
