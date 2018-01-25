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
    self.app.rpc.chat.chatRemote.roomInfo(session, uid, null, function(err, data) {
      if (err) return next(err);
      console.log('room data..........', data);
      self.app.rpc.message.messageRemote.getLastMessage(session, data, function(err, res) {

        if (err) return next(err);


        next(null, res);
      });

    });
  }
}