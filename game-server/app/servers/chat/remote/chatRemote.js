'use strict';

module.exports = function(app) {
  return new ChatRemote(app);
};

var ChatRemote = function(app) {
  this.app = app;
  this.Room = require('../../../models/room')(app);
  this.channelService = app.get('channelService');
};

let prototype = ChatRemote.prototype;

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
prototype.add = function(uid, sid, cid, flag, cb) {
  let self = this;
  let channel = this.channelService.getChannel(cid, flag);
  let { loginMap } = channel;

  // let sessionService = self.app.get('sessionService');
  let [user] = uid.split('*');

  let loginer = loginMap.get(user) || {};
  // if (!loginer[uid]) {
  loginer[uid] = sid;
  loginMap.set(user, loginer);
  // }

  // 通知好友上线
  let param = {
    route: 'onAdd',
    user
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
prototype.roomInfo = function(uid, cid, cb) {
  this.Room.getUserRoomMap(uid, cid).then(map => {
    map.forEach(room => this.app.roomMap.set(room.roomid, room.room));
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
prototype.get = function(cid, flag) {
  var users = [];
  var channel = this.channelService.getChannel(cid, flag);
  if (!!channel) {
    let members = channel.getMembers();
    for (let i = 0; i < members.length; i++) {
      let mid = members[i].split('*')[0];
      if (users.indexOf(mid) < 0) users[i] = mid;
    }
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
prototype.kick = function(uid, sid, cb) {
  var [user, cid] = uid.split('*');
  var channel = this.channelService.getChannel(cid, false);
  // leave channel
  if (!!channel) {
    let { loginMap } = channel;
    let loginer = loginMap.get(user) || {};
    if (loginer[uid]) {
      delete loginer[uid];
    }
    channel.leave(uid, sid);
  }
  var param = {
    route: 'onLeave',
    user
  };

  this.app.rpc.account.accountRemote.unbindChannel(null, user, function(err, status) {
    channel.pushMessage(param);
    err && console.error(err);
    cb && cb();
  });
};
