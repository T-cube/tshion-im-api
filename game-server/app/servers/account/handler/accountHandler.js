'use strict';

module.exports = function(app) {
  return new accountHandler(app);
};

class accountHandler {
  constructor(app) {
    this.app = app;
  }

  initInfo(msg, session, next) {
    let self = this;

    let [uid, cid] = session.uid.split('*');
    uid = 'xuezier';
    self.app.rpc.chat.chatRemote.roomInfo(session, uid, function(err, data) {
      if (err) return next(err);

      self.app.rpc.message.messageRemote.getLastMessage(session, data, function(err, res) {

        if (err) return next(err);


        next(null, res);
      });

    });
  }
}