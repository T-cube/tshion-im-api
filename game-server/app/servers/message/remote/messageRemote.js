'use strict';

module.exports = function(app) {
  return new MessageRemote(app);
};

var MessageRemote = function(app) {
  this.app = app;
  this.messageCollection = app.db.collection('message');
  this.cacheMessageCollection = app.db.collection('message.offline');
  this.channelService = app.get('channelService');
};

const prototype = MessageRemote.prototype;

/**
 * send offline msg
 */
prototype.sendOfflineMessage = function(msg) {
  let self = this;
  return self.saveOfflineMessage(msg);
};

prototype.saveMessage = function(msg, cb) {
  let self = this;
  msg.data_create = new Date;

  self.messageCollection.insertOne(msg).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.saveOfflineMessage = function(msg, cb) {
  let self = this;
  msg.date_create = new Date;

  return Promise.all([self.messageCollection.insertOne(msg), self.cacheMessageCollection.insertOne(msg)]).then(results => {
    cb(null, results);
  }).catch(cb);
};

prototype.getOfflineMessage = function(target, cb) {
  let self = this;

  self.cacheMessageCollection.find({ target }).then(results => {
    if (!results || !results.length) return cb();
    cb(null, results);
  }).catch(cb);
};
