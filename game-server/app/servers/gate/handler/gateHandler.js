'use strict';
const dispatcher = require('../../../util/dispatcher');
const crypto = require('crypto');
const TOKEN_EXPIRE = 60 * 60 * 24 * 7;
// const TOKEN_EXPIRE = 60 * 30;

module.exports = function (app) {
  return new gateHandler(app);
};

class gateHandler {
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
    let self = this;
    let {token} = msg;
    console.log('your are here:', msg);
    if (!token) return next(null, {code: 500, message: 'token can not be null'});
    // get all connectors
    let connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length === 0) {
      next(null, {
        code: 500,
        message: 'no connectors'
      });
      return;
    }
    // 在这里向后台发送登陆服务请求
    self.app.rpc.account.accountRemote.login(null, token, function (err, data) {
      // console.log('end rpc=======', data);

      if (err) return next(err);

      let {user_id} = data;
      const init_token = crypto.createHash('sha1').update(`${user_id}:${+new Date}`).digest('hex');
      // select connector
      var res = dispatcher.dispatch(user_id, connectors);
      // console.log(res);
      self.app.tokenRedis.setex(init_token, TOKEN_EXPIRE, JSON.stringify({
        uid: user_id,
        hostname: res.hostname,
        host: res.host,
        port: res.clientPort
      })).then(result => {
        console.log(result);
        next(null, {
          code: 200,
          hostname: res.hostname,
          host: res.host,
          port: res.clientPort,
          init_token
        });
      }).catch(e => {
        console.error(e);
        next({error: 'server redis error'});
      });
    });
  }

  tokenEntry(msg, session, next) {
    let self = this;

    let {init_token, uid} = msg;

    console.log('init_tokeb::::::::::::', init_token);
    self.app.tokenRedis.get(init_token).then(result => {
      if (!result) return next({error: 'init_token expired or no exists'});

      const json = JSON.parse(result);

      if (json.uid != uid) return next({error: 'init_token no worked for this user'});

      next(null, {
        code: 200,
        host: json.host,
        port: json.port
      });
    }).catch(e => {
      console.error(e);
      next({error: 'server redis error'});
    });
  }
}