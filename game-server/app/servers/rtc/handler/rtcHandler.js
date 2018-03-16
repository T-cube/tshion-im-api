'use strict';
const _ = require('../../../../libs/util');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;

  this.audioDialMap = new Map();

  this.channelService = app.get('channelService');
};

var prototype = Handler.prototype;

/**
 * 调起语音拨打
 * @param {{}} msg
 * @param {*} session
 * @param {Function} next
 */
prototype.audioDial = function(msg, session, next) {
  let self = this;
  let [uid] = session.uid.split('*');

  self.app.rpc.account.accountRemote.userInfo(null, { _id: uid }, { name: 1, avatar: 1 }, function(err, user) {

    if (err) {
      return next({ err: 400, error: 'target error' });
    }

    let param = {
      route: 'audio.dial',
      dial: msg.dial,
      from: user
    };

    // let [from, target] = msg.dial.split('_');
    // if (self.audioDialMap.has(from)) {
    //   return next({ code: 400, error: 'from_dialing' });
    // }
    // if (self.audioDialMap.has(target)) {
    //   return next({ code: 400, error: 'target_dialing' });
    // }

    // self.audioDialMap.set(from);
    // self.audioDialMap.set(target);

    self.app.rpc.chat.chatRemote.channelPushMessageByUid(session, 'global', param, msg.target, function(err) {
      if (err) {
        return next({ code: 400, error: err });
      }

      next(null, { code: 200 });
    });
  });
};

/**
 * 接收语音拨打
 * @param {*} msg
 * @param {*} session
 * @param {*} next
 */
prototype.audioDialAcess = function(msg, session, next) {
  let self = this;
  let [uid] = session.uid.split('*');

  let param = {
    route: 'audio.dial.access',
    from: uid
  };

  self.app.rpc.chat.chatRemote.channelPushMessageByUid(session, 'global', param, msg.target, function(err) {
    if (err) return next({ code: 400, error: err });

    next(null, { code: 200 });
  });
};


prototype.audioDialReject = function(msg, session, next) {
  let self = this;
  let [uid] = session.uid.split('*');

  let param = {
    route: 'audio.dial.reject',
    from: uid
  };

  self.app.rpc.chat.chatRemote.channelPushMessageByUid(session, 'global', param, msg.target, function(err) {
    if (err) return next({ code: 400, error: err });

    next(null, { code: 200 });
  });
};


/**
 * 调起视频拨打
 * @param {{}} msg
 * @param {*} session
 * @param {Function} next
 */
prototype.videoDial = function(msg, session, next) {
  let self = this;
  let [uid] = session.uid.split('*');

  self.app.rpc.account.accountRemote.userInfo(null, { _id: uid }, { name: 1, avatar: 1 }, function(err, user) {

    if (err) {
      return next({ err: 400, error: 'target error' });
    }

    let param = {
      route: 'video.dial',
      dial: msg.dial,
      from: user
    };

    // let [from, target] = msg.dial.split('_');
    // if (self.videoDialMap.has(from)) {
    //   return next({ code: 400, error: 'from_dialing' });
    // }
    // if (self.videoDialMap.has(target)) {
    //   return next({ code: 400, error: 'target_dialing' });
    // }

    // self.videoDialMap.set(from);
    // self.videoDialMap.set(target);

    self.app.rpc.chat.chatRemote.channelPushMessageByUid(session, 'global', param, msg.target, function(err) {
      if (err) {
        return next({ code: 400, error: err });
      }

      next(null, { code: 200 });
    });
  });
};

/**
 * 接收语音拨打
 * @param {*} msg
 * @param {*} session
 * @param {*} next
 */
prototype.videoDialAcess = function(msg, session, next) {
  let self = this;
  let [uid] = session.uid.split('*');

  let param = {
    route: 'video.dial.access',
    from: uid
  };

  self.app.rpc.chat.chatRemote.channelPushMessageByUid(session, 'global', param, msg.target, function(err) {
    if (err) return next({ code: 400, error: err });

    next(null, { code: 200 });
  });
};


prototype.videoDialReject = function(msg, session, next) {
  let self = this;
  let [uid] = session.uid.split('*');

  let param = {
    route: 'video.dial.reject',
    from: uid
  };

  self.app.rpc.chat.chatRemote.channelPushMessageByUid(session, 'global', param, msg.target, function(err) {
    if (err) return next({ code: 400, error: err });

    next(null, { code: 200 });
  });
};
