/**
 * Created by yiban on 2016/10/14.
 */
'use strict';

const debug     = require('debug')('MiPushFeedback'),
  constants = require('./constants'),
  request = require('./request');

var Feedback = function (options) {
  debug('init Feedback:', options);

  this.appSecret = options.appSecret;
  this.request   = request;
  this.constants = new constants();
};

Feedback.prototype.getInvalidRegIds = function (callback) {
  this.request('GET', this.constants.feedbackUrl, {}, callback);
};

Feedback.prototype.getInvalidAlias = function (regId, callback) {
  this.request('GET', this.constants.aliasStatsUrl, {registration_id: regId}, callback);
};

module.exports = Feedback;