/**
 * Created by yiban on 2016/10/14.
 */
'use strict';

const debug     = require('debug')('MiPush:Tracer'),
  constants = require('./constants'),
  request = require('./request');

/***
 * 消息状态追踪类
 * @param options
 * @constructor
 */
var Tracer = function (options) {
  debug('init tracer:', options);

  this.request   = request;
  this.constants = new constants();
  this.appSecret = options.appSecret;
};

Tracer.prototype.getMessageStatus = function (msgId, callback) {
  var data = { msg_id: msgId },
    url = this.constants.tracerMessageUrl;

  this.request('GET', url, data, callback);
};

Tracer.prototype.getMessagesStatus = function (beginTime, endTime, callback) {
  var data = {
    begin_time: beginTime,
    end_time: endTime
  }, url = this.constants.tracerMessagesUrl;

  this.request('GET', url, data, callback);
};

Tracer.prototype.getMessageGroupStatus = function (jobKey, callback) {
  var data = { job_key: jobKey },
    url = this.constants.tracerMessageUrl;

  this.request('GET', url, data, callback);
};

module.exports = Tracer;