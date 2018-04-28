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

  this.app.rpc.channel.channelRemote.bindChannel(null, uid, cid, sid, flag, function(err, result) {
    cb(null, result);
  });


  // 通知好友上线
  // let param = {
  //   route: 'onAdd',
  //   user
  // };
  // channel.pushMessage(param);

  // if (!!channel) {
  //   let member = channel.getMember(uid);
  //   if (member) {
  //     let sid = member['sid'];
  //     channel.leave(uid, sid);
  //   }
  // }
  // channel.add(uid, sid);

  // cb({ users: self.get(cid, flag), members: self.get(cid, flag) });
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
  let channel = this.channelService.getChannel('global', flag);
  if (channel) {
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
  this.app.rpc.channel.channelRemote.kickChannel(null, uid, sid, function(err) {
    cb && cb();
  });
  // var param = {
  //   route: 'onLeave',
  //   user
  // };
  // console.log(param, '>>>>>>>>>>>>>>>>>>>>>>>>>1');

  // this.app.rpc.account.accountRemote.unbindChannel(null, user, function(err, status) {
  //   console.log(param, '>>>>>>>>>>>>>>>>>>>>>>>>>');
  //   channel.pushMessage(param);
  //   err && console.error(err);
  //   cb && cb();
  // });
};

prototype.channelPushMessage = function(channelId, params, cb) {
  var self = this;

  var channel = self.channelService.getChannel(channelId);

  channel.pushMessage(params);

  cb(null);
};

/**
 * push message by target uid
 * @param {Strinh} channelId
 * @param {{}} params
 * @param {String} target
 * @param {Function} cb
 */
prototype.channelPushMessageByUid = function(channelId, params, target, cb) {
  let self = this;

  var channel = self.channelService.getChannel(channelId, false);

  let { loginMap } = channel;
  let loginer = loginMap.get(target);

  let clients = [];
  for (let tuid in loginer) {
    let sid = loginer[tuid];
    clients.push({ uid: tuid, sid });
  }

  if (!clients.length) {
    return cb('user offline');
  }

  self.channelService.pushMessageByUids(params, clients);
  cb(null);
};

prototype.channelPushMessageByUids = function(params, clients, cb) {
  var self = this;

  self.channelService.pushMessageByUids(params, clients);

  cb(null);
};
