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
    cb(null, result);
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

prototype.saveOfflineMessages = function(msg, uids, cb) {
  let msgs = uids.map(uid => {
    msg.target = uid;
    return new this.Message(msg);
  });

  this.Message.saveOfflineMessages(msgs).then(cb).catch(cb);
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

prototype.getLastMessage = function(user, rooms, cb) {
  let self = this;

  self.Message.getLastMessage(rooms, user).then(results => {
    cb(null, results);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getMessage = function(message_id, cb) {
  this.Message.getMessage(message_id).then(message => cb(null, message)).catch(cb);
};
