/**
 * Created by yiban on 2016/10/14.
 */
"use strict";

const debug     = require('debug')('MiPush:subscription'),
      constants = require('./constants'),
      request   = require('./request');

var Subscription = function (options) {
  debug('init subscription:', options);

  this.request   = request;
  this.constants = new constants();
  this.appSecret = options.appSecret;
};

/*
 * 取消一个或一组regIds列表的标签
 * regIds: 单个regIds字符串 或 多个用逗号分隔regIds的字符串 或 regIds数组
 * 注: 多个regIds是最多限制1000个
 * topic: 标签名
 * category: 可为空
 */
Subscription.prototype.subscribeTopic = function (regIds, topic, category, callback) {
  debug('subscribeTopic:', regIds, topic, category);

  if (Array.isArray(regIds)) {
    regIds = regIds.join(',')
  }

  var data = {
    registration_id: regIds,
    topic          : topic,
    category       : category
  };

  this.request('POST', this.constants.subscribeUrl, data, callback);
};

Subscription.prototype.unSubscribeTopic = function (regIds, topic, category, callback) {
  debug('unSubscribeTopic:', regIds, topic, category);

  if (Array.isArray(regIds)) {
    regIds = regIds.join(',')
  }

  var data = {
    registration_id: regIds,
    topic          : topic,
    category       : category
  };

  this.request('POST', this.constants.unSubscribeUrl, data, callback);
};

Subscription.prototype.subscribeTopicByAlias = function (aliases, topic, category, callback) {
  debug('subscribeTopicByAlias:', aliases, topic, category);

  if (Array.isArray(aliases)) {
    aliases = aliases.join(',')
  }

  var data = {
    aliases : aliases,
    topic   : topic,
    category: category
  };

  this.request('POST', this.constants.subscribeAliasUrl, data, callback);
};

Subscription.prototype.unSubscribeTopicByAlias = function (aliases, topic, category, callback) {
  debug('unSubscribeTopicByAlias:', aliases, topic, category);

  if (Array.isArray(aliases)) {
    aliases = aliases.join(',')
  }

  var data = {
    aliases : aliases,
    topic   : topic,
    category: category
  };

  this.request('POST', this.constants.unSubscribeAliasUrl, data, callback);
};

module.exports = Subscription;