'use strict';
module.exports = function(app) {
  return new MessageRemote(app);
};

var MessageRemote = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
  this.Message = require('../../../models/message')(app);

};

const prototype = MessageRemote.prototype;

prototype.saveMessage = function(msg, cb) {
  let self = this;

  new this.Message(msg).save().then(result => {
    msg._id = result.insertedId;
    cb(null, msg);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.saveOfflineMessage = function(msg, cb) {
  new this.Message(msg).saveOffline().then(results => {
    cb(null, results);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getOfflineMessage = function(target, cb) {
  this.Message.offlineMessageCount({ target }).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};
