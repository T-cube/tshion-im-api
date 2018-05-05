'use strict';

module.exports = function(app) {
  return new PushRemote(app);

};
const PushRemote = function(app) {
  this.app = app;
  this.Notification = require('../../../vendor/notification')(app);
};
const prototype = PushRemote.prototype;

prototype.notifyClient = function(route, msg, target, cb) {
  var param = {route, msg};

  this.app.rpc.channel.channelRemote.channelPushMessageByUid(null, param, target, cb);
};

prototype.setMessageContent = function(msg) {
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

  return msg;
};


prototype.pushMessageMany = function(msg, uids, cb) {
  msg = this.setMessageContent(msg);

  uids.map(uid=>{
    msg.target = uid;

    this.Notification.createNotification(msg);
  });
  cb();
};

prototype.pushMessageOne = function(msg, cb) {
  msg = this.setMessageContent(msg);

  this.Notification.createNotification(msg);
  cb();
};
