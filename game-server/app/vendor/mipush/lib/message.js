/**
 //Created by yiban on 2016/10/14.
 */
'use strict';

const debug = require('debug'),
  qs = require('querystring');

var Message = function () {
  this.pass_through = 0;
  this.notify_type  = -1;
};

Message.prototype.payload = function (payload) {
  this.payload = qs.escape(payload);
};

Message.prototype.title = function (title) {
  this.title = title;
};

Message.prototype.description = function (description) {
  this.description = description;
};

//1: 透传消息  0：通知栏消息
Message.prototype.passThrough = function (passThrough) {
  this.pass_through = passThrough;
};

//DEFAULT_ALL = -1;
//DEFAULT_SOUND  = 1;   // 使用默认提示音提示
//DEFAULT_VIBRATE = 2;   // 使用默认震动提示
//DEFAULT_LIGHTS = 4;    // 使用默认led灯光提示
Message.prototype.notifyType = function (notifyType) {
  this.notify_type = notifyType;
};

Message.prototype.restrictedPackageName = function (packageName) {
  this.restricted_package_name = packageName;
};

/*
 * 可选项. 如果用户离线, 设置消息在服务器保存的时间, 单位：ms.
 * 服务器默认最长保留两周.
 */
Message.prototype.timeToLive = function (milliseconds) {
  this.time_to_live = milliseconds;
};

/*
 * 可选项. 定时发送消息.
 * timeToSend是以毫秒为单位的时间戳. 注：仅支持七天内的定时消息.
 */
Message.prototype.timeToSend = function (timeToSend) {
  this.time_to_send = timeToSend;
};

/*
 * 可选项. 默认情况下, 通知栏只显示一条推送消息
 * 如果通知栏要显示多条推送消息, 需要针对不同的消息设置不同的notify_id
 *（相同notify_id的通知栏消息会覆盖之前的）.
 */
Message.prototype.notifyId = function (id) {
  this.notify_id = id;
};

/*
 * 可选项. 控制消息是否需要进行平缓发送（qps less 1000/second）. 默认不支持.
 * 0 表示不支持平缓发送; 1 表示支持平缓发送
 */
Message.prototype.enableFlowControl = function (needFlowControl) {
  this.flow_control = needFlowControl;
};

Message.prototype.extra = function (key, value) {
  this['extra.' + key] = value;
};

module.exports = Message;