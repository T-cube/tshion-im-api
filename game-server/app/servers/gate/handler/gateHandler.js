'use strict';
var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
  return new Handler(app);
};

class Handler {
  constructor(app) {
    this.app = app;
  }

  /**
   * Gate handler that dispatch user to connectors.
   *
   * @param {Object} msg message from client
   * @param {Object} session
   * @param {Function} next next stemp callback
   *
   */
  queryEntry(msg, session, next) {
    let { username, pass } = msg;
    if (!username) {
      next(null, {
        code: 500,
        message: 'username no found'
      });
      return;
    }
    // get all connectors
    var connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length === 0) {
      next(null, {
        code: 500,
        message: 'no connectors'
      });
      return;
    }
    // 在这里向后台发送登陆服务请求
    this.app.rpc.account.accountRemote.login(null, username, pass, function(err, data) {
      console.log('end rpc=======', data);

      if (err) return next(err);

      // select connector
      var res = dispatcher.dispatch(username, connectors);
      next(null, {
        code: 200,
        host: res.host,
        port: res.clientPort
      });
    });
  };

}
