'use strict';
module.exports = function(app) {
  return new entryHandler(app);
};

var Handler = function(app) {
  this.app = app;
};

class entryHandler {
  constructor(app) {
    this.app = app;
  }

  /**
   * New client entry chat server.
   *
   * @param  {Object}   msg     request message
   * @param  {Object}   session current session object
   * @param  {Function} next    next stemp callback
   * @return {Void}
   */
  enter(msg, session, next) {
    let self = this;
    let { cid, init_token } = msg;

    self.app.tokenRedis.get(init_token).then(result => {
      if (!result) return next({ code: 404, error: 'init_token expired or no exists' });

      const json = JSON.parse(result);
      let { uid } = json;

      let tuid = `${uid}*${cid}`;

      //duplicate log in
      session.bind(tuid);
      session.set('cid', cid);
      session.push('cid', function(err) {
        if (err) {
          console.error('set cid for session service failed! error is : %j', err.stack);
        }
      });
      session.on('closed', onUserLeave.bind(null, self.app, session));
      //put user into channel
      self.app.rpc.chat.chatRemote.add(session, tuid, self.app.get('serverId'), cid, true, function(result) {
        let { users, members } = result;
        self.app.rpc.account.accountRemote.bindChannel(session, uid, cid, function(err, status) {
          if (err || !status) return next(err);
          next(null, {
            cid,
            users,
            members
          });
        });
      });

    }).catch(e => {
      console.error(e);
      next({ error: 'server redis error' });
    });
  };

  /**
   * User log out by self
   */
  kick(msg, session, next) {
    let self = this;

    self.onUserLeave(self.app, session, function() {
      next(null, {});
    });
  };
}

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session, cb) {
  console.log('user leave=======');
  if (!session || !session.uid) {
    return;
  }
  app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('cid'), cb || null);
};