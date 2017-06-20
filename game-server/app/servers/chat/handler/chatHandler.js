'use strict';
const chatRemote = require('../remote/chatRemote');
const _ = require('../../../../libs/util');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
  // app.roomMap = new Map();
};

var prototype = Handler.prototype;

/**
 * Join chatRoom
 */
prototype.joinRoom = function(msg, session, next) {
  let self = this;
  let { target, target_cid } = msg;
  let [uid, fcid] = session.uid.split('*');
  let param = {
    route: 'joinRoom',
    from: uid,
  };

  if (!target || !target_cid) return next({ error: 'target can not be null,target_cid can not be null' });

  self.app.rpc.account.accountRemote.bindRoom(session, { uid, target, fcid, target_cid }, function(err, room) {
    if (err) return next(err);
    console.log(target, '.............');
    console.log(room);
    self.app.onlineRedis.get(target).then(cid => {
      console.log(cid);
      let msg = room;
      if (!cid) msg.error = 'user offline';
      else {
        let channel = self.channelService.getChannel(cid, false);
        // roomid save 2 people channelid
        self.app.roomMap.set(room.roomid, {
          [uid]: fcid,
          [target]: target_cid
        });


        if (target == '*') {
          channel.pushMessage(param);
        } else {
          let tuid = `${target}*${target_cid}`;
          let member = channel.getMember(tuid);
          let tsid = member['sid'];
          self.channelService.pushMessageByUids(Object.assign(param, room), [{ uid: tuid, sid: tsid }]);
        }
      }
      next(null, msg);
    }).catch(e => {
      console.error('error redis.......', e);
      next(e);
    });
  });
};

prototype.unActiveRoom = function(msg, session, next) {
  let self = this;
  let { roomid } = msg;
  if (!roomid) return next({ error: 'roomid error' });

  self.app.rpc.account.accountRemote.unActiveRoom(session, roomid, function(err, result) {
    if (err) return next(err);
    next(null, result);
  });
};

/**
 * send an notify in group
 * @param {Object} options
 * @param {Array} options.members
 * @param {String} options.cid
 * @param {Object} options.param
 */
prototype.notifyGroup = function(options) {
  let self = this;

  let { members, cid, param } = options;
  let channel = self.channelService.getChannel(cid);
  if (!channel) return;

  let users = [];
  for (let member of members) {
    let uid = `${member}*${cid}`;
    let _member = channel.getMember(uid);
    if (_member) users.push({ uid, sid: _member['sid'] });
  }

  users.length && self.channelService.pushMessageByUids(param, users);
};
/**
 * init group
 * @param {Object} msg
 * @param {Array} msg.members
 * @param {String} msg.group
 * @param {Function} next
 */
prototype.initGroup = function(msg, session, next) {
  let self = this;
  let { members, group } = msg;

  let [creator, cid] = session.uid.split('*');

  let channel = self.channelService.getChannel(cid);
  !channel.groupMap && (channel.groupMap = new Map());
  let map = channel.groupMap;

  let info = map.get(group);

  if (info) {
    return next(null, { roomid: info.roomid });
  }

  self.app.rpc.group.groupRemote.init(session, creator, group, members, function(err, result) {
    if (err) return next(err);
    console.log(result);
    let { roomid } = result;
    map.set(group, { members, roomid: result.roomid });

    self.notifyGroup({ members, cid, param: { route: 'groupInit', roomid, group } });
    next(null, result);
  });
};

/**
 * add members to group
 * @param {Object} msg
 * @param {Array} msg.members
 * @param {String} msg.group
 * @param {Object} session
 * @param {Function} next
 */
prototype.addGroupMember = function(msg, session, next) {
  let self = this;

  let { members, group } = msg;
  let [creator, cid] = session.uid.split('*');


  self.app.rpc.group.groupRemote.insertMembers(session, creator, group, members, function(err, result) {
    if (err) return next(err);

    let channel = self.channelService.getChannel(cid);
    let map = channel.groupMap;
    let info = map.get(group);
    info.members = result.members;
    map.set(group, info);

    self.notifyGroup({ members: info.members, cid, param: { group, members, route: 'addMember', from: creator } });

    next(null, result);
  });
};

/**
 * remove members from group
 * @param {Object} msg
 * @param {Array} msg.members
 * @param {String} msg.group
 * @param {Object} session
 * @param {Function} next
 */
prototype.removeGroupMember = function(msg, session, next) {
  let self = this;

  let { members, group } = msg;

  let [creator, cid] = session.uid.split('*');

  if (members.indexOf(creator) > -1) return next({ code: 400, error: 'you can not remove youself from group' });

  self.app.rpc.group.groupRemote.removeMembers(session, creator, group, members, function(err, result) {
    if (err) return next(err);

    let channel = self.channelService.getChannel(cid);
    let map = channel.groupMap;
    let info = map.get(group);
    info.members = result.members;
    map.set(group, info);

    self.notifyGroup({ members: info.members, cid, param: { group, members, route: 'removeMember', from: creator } });
    self.notifyGroup({ members, cid, param: { group, route: 'leaveGroup', from: creator } });

    next(null, result);
  });

};

/**
 * send group msg
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 */
prototype.sendGroup = function(msg, session, next) {
  let self = this;
  let { group } = msg;
  let [from, cid] = session.uid.split('*');

  const channel = self.channelService.getChannel(cid);
  let map = self.groupMap;
  let info = map.get(group);

  if (!info) return next({ code: 500, error: 'service no found this group' });

  let { roomid, members } = info;

  if (members.indexOf(from) < 0) return next({ code: 400, error: 'you have not in this group' });

  let param = Object.assign(msg, {
    route: 'groupChat',
    roomid,
    from
  });

  let users = [];
  let offlineUsers = [];
  let notifyUsers = [];

  for (let member of members) {
    let uid = `${member}*${cid}`;
    let _member = channel.getMember(uid);
    if (!_member) offlineUsers.push(member);
    else {
      users.push(member);
      notifyUsers.push({ uid, sid: _member['sid'] });
    }
  }

  self.channelService.pushMessageByUids(param, notifyUsers);

  self.app.rpc.message.messageRemote.saveGroupMessage(session, param, offlineUsers, function(err) {
    if (err) return next(err);

    next(null, { route: param.route });
  });
};

/**
 * Add deviceToken to session
 * @param {Object} msg
 * @param {String} msg.deviceToken
 */
prototype.deviceToken = function(msg, session, next) {
  let self = this;
  let [uid, cid, client] = session.uid.split('*'), { deviceToken } = msg;
  if (client) {
    session.set('deviceToken', deviceToken);
    console.log('.........', client, deviceToken, '.............');
    if (!deviceToken) return;
    self.app.rpc.account.accountRemote.saveDeviceToken(null, { uid, cid, client, deviceToken }, function(err, value) {
      if (err) console.error(err);
      console.log('save device token:', value);
      next(null, {});
    });
  }
};

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
prototype.send = function(msg, session, next) {
  let self = this;
  let { target, roomid, content } = msg;
  content = content.replace(/&nbsp;/g, ' ');
  if (_.isBlank(content)) return next({ code: 400, error: 'chat content can not be blank' });

  let room = self.app.roomMap.get(roomid);
  let cid = room ? room[target] : null;
  var [from] = session.uid.split('*');
  var param = Object.assign(msg, {
    route: 'onChat',
    roomid,
    from,
    target
  });

  let channel = cid ? self.channelService.getChannel(cid, false) : null;
  // if (!channel) {
  //   return self.app.rpc.message.messageRemote.saveOfflineMessage(null, param, function(err) {
  //     if (err) return next(err);
  //     next({ code: 404, error: 'user offline' });
  //   });
  // }
  console.log('save message', msg);
  self.app.rpc.message.messageRemote.saveMessage(null, msg, (err, result) => {
    if (err) return next(err);

    if (!channel) {
      next(null, { route: param.route, msg: result });
      return self.app.rpc.message.messageRemote.saveOfflineMessage(null, param, function(err) {
        err && console.error(err);
      });
    }

    param = Object.assign(param, result);
    if (target == '*') {
      channel.pushMessage(param);
    } else {
      // let uid = `${target}*${cid}`;
      // let member = channel.getMember(uid);
      let { loginMap } = channel;
      let loginer = loginMap.get(target);
      let clients = [];
      let mobile = false;
      for (let tuid in loginer) {
        let sid = loginer[tuid];
        // (tuid.indexOf('ios') || tuid.indexOf('android')) && (mobile = true);
        clients.push({ uid: tuid, sid });
      }

      if (!clients.length) return self.app.rpc.message.messageRemote.saveOfflineMessage(null, param, function(err) {
        if (err) return next(err);
        self.app.rpc.push.pushRemote.pushMessageOne(null, result, null);
        next({ route: param.route, msg: result, code: 404, error: 'user offline' });
      });

      // let sid = member['sid'];
      // self.channelService.pushMessageByUids(param, [{ uid, sid }]);
      self.channelService.pushMessageByUids(param, clients);
      self.app.rpc.push.pushRemote.pushMessageOne(null, result, null);
      // !mobile && self.app.rpc.push.pushRemote.pushMessageOne(null, result, null);
    }

    next(null, {
      route: param.route,
      msg: result
    });
  });

  self.app.rpc.account.accountRemote.activeRoom(session, roomid, function(err) {
    err && console.log(err);
  });
};
