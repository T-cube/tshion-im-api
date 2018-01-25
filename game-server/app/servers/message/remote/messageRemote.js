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
  new this.Message(msg).saveOffline().then(result => {
    cb(null, result);
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


prototype.saveGroupMessage = function(msg, offlineMembers = [], cb) {
  let self = this;

  if (!offlineMembers.length) new self.Message(msg).save().then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
  else Promise.all([new self.Message(msg).save(), self.Message.saveMany(offlineMembers.map(target => {
    return new self.Message(Object.assign(msg, { target }));
  }), true)]).then(results => cb(null, results)).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getLastMessage = function(rooms, cb) {
  let self = this;

  self.Message.getLastMessage(rooms).then(results => {
    cb(null, results);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};