'use strict';
var chatRemote = require('../remote/chatRemote');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
  app.roomMap = new Map();
};

var prototype = Handler.prototype;

/**
 * Join chatRoom
 */
prototype.joinRoom = function(msg, session, next) {
  let self = this;
  let { target } = msg;
  let [username, fcid] = session.uid.split('*');
  let param = {
    route: 'joinRoom',
    from: username,
  };

  self.app.rpc.account.accountRemote.bindRoom(session, username, target, function(err, roomid) {
    if (err) return next(err);

    self.app.onlineRedis.get(target).then(cid => {
      if (!cid) return next({ code: 404, error: 'user offline' });
      let channel = self.channelService.getChannel(cid, false);
      // roomid save 2 people channelid
      self.app.roomMap.set(roomid, {
        [username]: fcid,
        [target]: cid
      });


      param.roomid = roomid;
      if (target == '*') {
        channel.pushMessage(param);
      } else {
        let tuid = `${target}*${cid}`;
        let member = channel.getMember(tuid);
        let tsid = member['sid'];
        self.channelService.pushMessageByUids(param, [{ uid: tuid, sid: tsid }]);
      }
      next(null, { code: 200, roomid });
    }).catch(e => {
      console.error('error redis.......', e);
      next(e);
    });
  });
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
  let { target, roomid } = msg;
  let cid = self.app.roomMap.get(roomid)[target];
  var username = session.uid.split('*')[0];
  var param = Object.assign(msg, {
    route: 'onChat',
    roomid,
    date_create: new Date,
    from: username,
    target: msg.target
  });

  let channel = self.channelService.getChannel(cid, false);
  console.log(channel);
  if (!channel) {
    return self.app.rpc.message.messageRemote.saveOfflineMessage(null, param, function(err) {
      if (err) return next(err);
      next({ code: 404, error: 'user offline' });
    });
  }

  if (target == '*') {
    channel.pushMessage(param);
  } else {
    let uid = `${target}*${cid}`;
    let sid = channel.getMember(uid)['sid'];
    self.channelService.pushMessageByUids(param, [{ uid, sid }]);
  }
  self.app.rpc.message.messageRemote.saveMessage(null, msg, function() {
    next(null, {
      route: param.route
    });
  });
};
