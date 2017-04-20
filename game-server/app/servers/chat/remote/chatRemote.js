'use strict';

module.exports = function(app) {
  return new ChatRemote(app);
};

var ChatRemote = function(app) {
  this.app = app;
  this.Room = require('../../../models/room')(app);
  this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, cid, flag, cb) {
  let self = this;
  let channel = this.channelService.getChannel(cid, flag);
  let sessionService = self.app.get('sessionService');
  let username = uid.split('*')[0];

  // 通知好友上线
  let param = {
    route: 'onAdd',
    user: username
  };
  channel.pushMessage(param);

  if (!!channel) {
    let member = channel.getMember(uid);
    if (member) {
      let sid = member['sid'];
      channel.leave(uid, sid);
    }
  }
  channel.add(uid, sid);

  cb({ users: self.get(cid, flag), members: self.get(cid, flag) });
};

/**
 * Get user RoomMap
 * @param {String} uid
 * @param {Function} cb
 */
ChatRemote.prototype.roomInfo = function(uid, cid, cb) {
  this.Room.getUserRoomMap(uid, cid).then(map => {
    cb(null, map);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
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
ChatRemote.prototype.get = function(cid, flag) {
  var users = [];
  var channel = this.channelService.getChannel(cid, flag);
  if (!!channel) {
    users = channel.getMembers();
  }
  for (var i = 0; i < users.length; i++) {
    users[i] = users[i].split('*')[0];
  }
  return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, cb) {
  var [user_id, cid] = uid.split('*')[0];
  var channel = this.channelService.getChannel(cid, false);
  // leave channel
  if (!!channel) {
    channel.leave(uid, sid);
  }
  var param = {
    route: 'onLeave',
    user: user_id
  };
  this.app.rpc.account.accountRemote.unbindChannel(null, user_id, function(err, status) {
    channel.pushMessage(param);
    err && console.error(err);
    cb && cb();
  });
};