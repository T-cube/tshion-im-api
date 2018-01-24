/**
 * Created by yiban on 2016/10/14.
 */
"use strict";

/**
 * 常量定义
 * @author zhaoxuan
 * @name Constants
 * @desc 常量定义
 */
const domain = "https://api.xmpush.xiaomi.com";

var Constants = function () {
  this.packageName = '';
  this.appSecret   = '';

  this.feedbackUrl = 'https://feedback.xmpush.xiaomi.com/v1/feedback/fetch_invalid_regids';
  this.statsUrl    = domain + '/v1/stats/message/counters';

  this.aliasStatsUrl = domain + '/v1/alias/all';
  this.topicStatsUrl = domain + '/v1/topic/all';

  this.tracerMessageUrl  = domain + '/v1/trace/message/status';
  this.tracerMessagesUrl = domain + '/v1/trace/messages/status';

  this.regIdUrl      = domain + '/v3/message/regid';
  this.aliasUrl      = domain + '/v3/message/alias';
  this.accountUrl    = domain + '/v2/message/user_account';
  this.topicUrl      = domain + '/v3/message/topic';
  this.multiTopicUrl = domain + '/v3/message/multi_topic';
  this.allUrl        = domain + '/v3/message/all';

  this.multiMessageRegIdsUrl   = domain + '/v2/multi_messages/regids';
  this.multiMessageAliasesUrl  = domain + '/v2/multi_messages/aliases';
  this.multiMessageAccountsUrl = domain + '/v2/multi_messages/user_accounts';

  this.validationRegIdsUrl = domain + '/v1/validation/regids';

  this.subscribeUrl        = domain + '/v2/topic/subscribe';
  this.unSubscribeUrl      = domain + '/v2/topic/unsubscribe';
  this.subscribeAliasUrl   = domain + '/v2/topic/subscribe/alias';
  this.unSubscribeAliasUrl = domain + '/v2/topic/unsubscribe/alias';


  this.deleteScheduleJobUrl  = domain + '/v2/schedule_job/delete';
  this.checkScheduleExistUrl = domain + '/v2/schedule_job/exist';
};

Constants.prototype.setPackageName = function(packageName) {
  this.packageName = packageName;
};

Constants.prototype.setSecret = function(secret) {
  this.appSecret = secret;
};

module.exports = Constants;
