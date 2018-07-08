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
  let [uid] = session.uid.split('*');
  let param = {
    route: 'joinRoom',
    from: uid,
  };
  console.log(msg);
  console.log(target);
  self.app.rpc.account.accountRemote.getChannelId(session, session.uid, function(fcid) {
    self.app.rpc.channel.channelRemote.getUserChannelId(session, target, function(err, channelId) {
      self.app.rpc.account.accountRemote.getDeviceToken(session, { uid: target }, function(err, tokens) {
        let token = tokens[0];
        if (token) {
          let { cid } = tokens[0];
          target_cid = cid;
        }
        // if (!target || !target_cid) return next({ code: 400, error: 'target can not be null,target_cid can not be null' });
        if (!target) return next({ code: 400, error: 'target can not be null' });
        self.app.rpc.account.accountRemote.bindRoom(session, { uid, target, fcid, target_cid }, function(err, room) {
          if (err) return next(err);
          console.log(':::::::::::::::;channelId', channelId);
          let msg = room;

          self.app.roomMap.set(room.roomid, {
            [uid]: fcid,
            [target]: target_cid
          });
          if (!channelId) {
            msg.error = 'user offline';
            msg.code = 404;
            next(msg);
          } else {
            // roomid save 2 people channelid
            self.app.rpc.channel.channelRemote.channelPushMessageByUid(session, Object.assign(param, room), target, function(err, result) {
              next(null, msg);
            });
          }
        });
      });
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
  let channel = self.channelService.getChannel('global');

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
  let channel = self.channelService.getChannel('global');
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
    let channel = self.channelService.getChannel('global');

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
    let channel = self.channelService.getChannel('global');
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
  let { roomid, content, type, from_name, group } = msg;

  if (type == 'text') {
    content = content.replace(/&nbsp;/g, ' ');
    if (_.isBlank(content)) return next({ code: 400, error: 'content can not be blank' });
  }

  let [from] = session.uid.split('*');
  var param = Object.assign(msg, {
    route: 'onChat.group',
    roomid,
    from
  });

  self.app.rpc.message.messageRemote.saveMessage(null, msg, (err, result) => {
    if (err) return next(err);

    result.from_name = from_name;

    self.app.rpc.group.groupRemote.getMemberIds(null, group, from, function(err, uids) {
      if (err) return next(err);

      param = Object.assign(param, result);
      self.app.rpc.channel.channelRemote.cahnnelPushMessageByUids(session, param, uids, function(err, offlines) {

        next(null, { route: param.route, msg, param });

        self.app.rpc.push.pushRemote.pushMessageMany(null, param, uids, () => {});

        self.app.rpc.message.messageRemote.saveOfflineMessages(null, param, offlines, () => {});

        self.app.rpc.account.accountRemote.activeRoom(session, roomid, function(err) {
          err && console.log(err);
        });
      });
    });
  });
};

/**
 * Add deviceToken to session
 * @param {Object} msg
 * @param {String} msg.deviceToken
 */
prototype.deviceToken = function(msg, session, next) {
  let self = this;
  let [uid, client] = session.uid.split('*'), { deviceToken, brand } = msg;
  if (client) {
    session.set('deviceToken', deviceToken);
    // console.log('.........', client, deviceToken, '.............');
    if (!deviceToken) return;
    self.app.rpc.account.accountRemote.getChannelId(session, session.uid, function(err, cid) {

      self.app.rpc.account.accountRemote.saveDeviceToken(null, { uid, cid, client, deviceToken, brand }, function(err, value) {
        if (err) console.error(err);
        console.log('save device token:', value);
        next(null, {});
      });
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
  let { target, roomid, content, type, from_name } = msg;

  if (type == 'text') {
    content = content.replace(/&nbsp;/g, ' ');
    if (_.isBlank(content)) return next({ code: 400, error: 'chat content can not be blank' });
  }

  var [from] = session.uid.split('*');
  var param = Object.assign(msg, {
    route: 'onChat',
    roomid,
    from,
    target
  });

  self.app.rpc.message.messageRemote.saveMessage(null, msg, (err, result) => {
    if (err) return next(err);

    result.from_name = from_name;
    param = Object.assign(param, result);
    self.app.rpc.channel.channelRemote.channelPushMessageByUid(session, param, target, function(err, res) {
      if (err == 'user offline') {
        self.app.rpc.message.messageRemote.saveOfflineMessage(null, param, function(err) {
          err && console.error(err);
          next(null, { route: param.route, msg: param, code: 404, error: 'user offline' });
        });
      } else {
        next(null, { route: param.route, msg: param });
      };
    });

    self.app.rpc.push.pushRemote.pushMessageOne(null, result, function(err, result) {
      if (err) console.warn(err);
    });

    self.app.rpc.account.accountRemote.activeRoom(session, roomid, function(err) {
      err && console.log(err);
    });
  });
};

prototype.saveOfflineMessage = function(msg, session, next) {
  let self = this;
  let { message_id } = msg;

  if (message_id) {
    self.app.rpc.message.messageRemote.getMessage(session, message_id, function(err, message) {
      if (err) return next(err);

      self.app.rpc.message.messageRemote.saveOfflineMessage(session, message, function(err) {
        if (err) return next(err);

        next({ code: 200 });
      });
    });
  } else {
    next({ code: 400, error: 'missing message_id' });
  }
};

prototype.checkOnline = function(msg, session, next) {
  next({ code: 200 });
};
