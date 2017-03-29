module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
  let self = this;
  let { cid } = msg;
  let uid = msg.username + '*' + cid;

  //duplicate log in
  session.bind(uid);
  session.set('cid', cid);
  session.push('cid', function(err) {
    if (err) {
      console.error('set cid for session service failed! error is : %j', err.stack);
    }
  });
  session.on('closed', onUserLeave.bind(null, self.app, session));
  //put user into channel
  self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), cid, true, function(result) {
    let { users, members } = result;
    self.app.rpc.account.accountRemote.bindChannel(session, msg.username, cid, function(err, status) {
      if (err || !status) return next(err);
      next(null, {
        cid,
        users,
        members
      });
    });
  });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
  console.log('user leave=======');
  if (!session || !session.uid) {
    return;
  }
  app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('cid'), null);
};
