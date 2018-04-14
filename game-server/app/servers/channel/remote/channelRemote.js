'use strict';

const channelConfig = require('../../../../config/config').channel;

module.exports = function(app) {
  return new ChannelRemote(app);
};

var ChannelRemote = function(app) {
  this.app = app;

  this.channelService = app.get('channelService');

  this.channelMap = new Map();
  var config = Object.assign({ numbers: 5 }, channelConfig);
  this.channelNumber = config.numbers;

  this.userChannelMap = new Map();
};


var prototype = ChannelRemote.prototype;


prototype.generateChannelId = function(cb) {
  let channelId = Math.round(Math.random() * this.channelNumber + 0.5);

  cb(null, channelId);
};

prototype.bindChannel = function(uid, sid, flag, cb) {
  // var channelId = Math.round(Math.random() * this.channelNumber + 0.5);

  var [user, channelId] = uid.split('*');
  var channel = this.channelService.getChannel(channelId, flag);


  var { loginMap } = channel;
  var loginer = loginMap.get(user) || {};
  loginer[uid] = sid;
  loginMap.set(user, loginer);

  this.userChannelMap.set(uid, channelId);
  channel.add(uid, sid);

  cb(null, { channel_id: channelId });
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
prototype.get = function(channelId, flag) {
  var users = [];
  let channel = this.channelService.getChannel(channelId, flag);
  if (!!channel) {
    let members = channel.getMembers();
    for (let i = 0; i < members.length; i++) {
      let mid = members[i].split('*')[0];
      if (users.indexOf(mid) < 0) users[i] = mid;
    }
  }
  return users;
};


prototype.kickChannel = function(uid, sid, cb) {
  var [user, channelId] = uid.split('*');

  // var channelId = this.userChannelMap.get(user);
  var channel = this.channelService.getChannel(channelId);
  // console.log(channel.name, ':::::::::::::::;');

  // leave channel
  if (!!channel) {
    var { loginMap } = channel;
    // console.log(loginMap, ':::::::::::::::;');
    if (loginMap) {
      var loginer = loginMap.get(user) || {};
      if (loginer[uid]) {
        delete loginer[uid];
      }
    }

    channel.leave(uid, sid);
  }

  this.app.rpc.account.accountRemote.unbindChannel(null, user, function(err) {
    if (err) {
      console.error(err);
    }
    cb && cb(null);
  });
};

prototype.channelPushMessage = function(channelId, params, cb) {
  var channel = this.channelService.getChannel(channelId);

  channel.pushMessage(params);

  cb();
};

/**
 * push message by target uid
 * @param {Strinh} channelId
 * @param {{}} params
 * @param {String} target
 * @param {Function} cb
 */
prototype.channelPushMessageByUid = function(params, target, cb) {
  var channelId = this.channelMap.get(target);
  var channel = this.channelService.getChannel(channelId);

  var { loginMap } = channel;
  var loginer = loginMap.get(target);

  var clients = [];
  for (let uid in loginer) {
    let sid = loginer[uid];
    clients.push({ uid, sid });
  }

  if (!clients.length) {
    return cb('user offline');
  }

  this.channelService.pushMessageByUids(params, clients);
  cb();
};
