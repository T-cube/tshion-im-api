'use strict';
module.exports = function (app) {
  return new MessageRemote(app);
};

var MessageRemote = function (app) {
  this.app = app;
  this.channelService = app.get('channelService');
  this.Message = require('../../../models/message')(app);
  this.Chat = require('../../../models/chat')(app);
};

const prototype = MessageRemote.prototype;

prototype.insertOrUpdateMsg = async function (msg) {
  let _id = msg._id, res;
  if (_id) {
    let findMsg = await this.Message.getMessage(msg._id);
    if (!findMsg) {
      throw new Error("no found findMsg _id:" + msg._id);
    }
    msg.target = findMsg.uid1;
    msg = await this.Chat.insertOrUpdate(msg);
    res = await this.Message.updateMessage(_id, msg);
  }
  else {
    msg = await this.Chat.insertOrUpdate(msg);
    res = await (new this.Message(msg)).save();
  }
  return res;
};

prototype.saveMessage = function (msg, cb) {

  this.insertOrUpdateMsg(msg).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
  })
};


prototype.saveOfflineMessage = function (msg, cb) {
  new this.Message(msg).saveOffline().then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getOfflineMessage = function (target, cb) {
  this.Message.offlineMessageCount({target}).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};


prototype.saveGroupMessage = function (msg, offlineMembers = [], cb) {
  let self = this;

  if (!offlineMembers.length) {
    new self.Message(msg).save().then(result => {
      cb(null, result);
    }).catch(e => {
      console.error(e);
      cb(e);
    });
  }
  else {
    Promise.all([new self.Message(msg).save(), self.Message.saveMany(offlineMembers.map(target => {
      return new self.Message(Object.assign(msg, {target}));
    }), true)]).then(results => cb(null, results)).catch(e => {
      console.error(e);
      cb(e);
    });
  }
};

prototype.getLastMessage = function (user, rooms, cb) {
  let self = this;

  self.Message.getLastMessage(rooms, user).then(results => {
    cb(null, results);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getMessage = function (message_id, cb) {
  this.Message.getMessage(message_id).then(message => cb(null, message)).catch(cb);
};
