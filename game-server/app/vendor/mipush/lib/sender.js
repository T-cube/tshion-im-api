/**
 * Created by yiban on 2016/10/14.
 */
'use strict';

const debug = require('debug')('MiPush:Sender'),
  constants = require('./constants'),
  request = require('./request');

/**
 * MiPush 消息发送类
 * @param options
 * @constructor
 */
var Sender = function(options) {
  debug('MiPush:Sender init:', options);

  this.appSecret = options.appSecret;
  this.request = request;
  this.urls = new constants();
};

//指定regId列表发送
Sender.prototype.sendToRegId = function(regId, message, callback) {
  debug('sendToRegId:', regId, message);

  if (!Array.isArray(regId)) {
    regId = [regId];
  }
  const url = this.urls.regIdUrl;

  message.registration_id = regId.join(',');
  request.call(this, 'POST', url, message, callback);
};
Sender.prototype.send = Sender.prototype.sendToRegId;

//指定别名列表发送
Sender.prototype.sendToAlias = function(alias, message, callback) {
  debug('sendToAlias:', alias, message);

  if (!Array.isArray(alias)) {
    alias = [alias];
  }
  const url = this.urls.aliasUrl;

  message.alias = alias.join(',');
  this.request('POST', url, message, callback);
};

//指定userAccount群发
Sender.prototype.sendToUserAccount = function(uc, message, callback) {
  debug('sendToUserAccount:', uc, message);

  if (!Array.isArray(uc)) {
    uc = [uc];
  }
  const url = this.urls.accountUrl;

  message.user_account = uc.join(',');
  request('POST', url, message, callback);
};

//指定topic群发
Sender.prototype.sendToTopic = function(topic, message, callback) {
  debug('sendToTopic:', topic, message);

  if (!Array.isArray(topic)) {
    topic = [topic];
  }
  const url = this.urls.topicUrl;

  message.topic = topic.join(',');
  request('POST', url, message, callback);
};

//向所有设备发送
Sender.prototype.sendToAll = function(message, callback) {
  debug('sendToAll:', message);

  const url = this.urls.allUrl;

  request('POST', url, message, callback);
};

//广播消息，多个topic间的交集、并集、差集等
//TODO
//以alisa或topic或userAccount为类别群发
//TODO
//以alisa或topic或userAccount为类别定时群发
//TODO
//检查定时任务是否存在
//TODO
//删除定时任务
//TODO
module.exports = Sender;
