/**
 * Created by yiban on 2016/10/14.
 */
"use strict";

const debug     = require('debug')('MiPush:stats'),
      constants = require('./constants'),
      request   = require('./request');

/***
 * 获取已发送推送的状态
 * @param options
 * @constructor
 */
var Stats = function (options) {
  debug('init stats:', options);

  this.request     = request;
  this.constants   = new constants();
  this.appSecret   = options.appSecret;
  this.packageName = options.packageName;
};

/*
 * startDate: 表示开始日期, 必须符合yyyyMMdd的格式.
 * endDate: 表示结束日期, 必须符合yyyyMMdd的格式.
 * 注: 开始结束日期之间的跨度小于30天
 */
Stats.prototype.getStats = function (startDate, endDate, callback) {
  debug('getStats:', startDate, endDate);

  var data = {
    start_date             : startDate,
    end_date               : endDate,
    restricted_package_name: this.packageName
  }, url   = this.constants.statsUrl;

  this.request('GET', url, data, callback);
};

Stats.prototype.getAliasesOf = function (regId, callback) {
  debug('getAliasesOf:', regId);

  var data = {
    registration_id        : regId,
    restricted_package_name: this.packageName
  }, url   = this.constants.aliasStatsUrl;

  this.request('GET', url, data, callback);
};

Stats.prototype.getTopicsOf = function (regId, callback) {
  debug('getAliasesOf:', regId);

  var data = {
    registration_id        : regId,
    restricted_package_name: this.packageName
  }, url   = this.constants.topicStatsUrl;

  this.request('GET', url, data, callback);
};

module.exports = Stats;