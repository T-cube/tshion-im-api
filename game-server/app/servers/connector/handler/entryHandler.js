'use strict';
module.exports = function(app) {
  return new entryHandler(app);
};

var Handler = function(app) {
  this.app = app;
  // this.sessionService = app.get('sessionService');
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
    let { cid, init_token, client } = msg;

    const db = self.app.db;
    const sup_requestCollection = db.collection('friend');
    const ObjectID = self.app.get('ObjectID');
    // console.log('msg',msg)
    console.log('init_token::::::::::::', init_token);
    new Promise((resolve, reject) => {
      if (cid) return resolve(cid);

      self.app.rpc.channel.channelRemote.generateChannelId(null, function(err, channelId) {
        if (err) return reject(err);
        console.log('channelId:::::::::;', channelId);
        resolve(channelId);
      });
    }).then(cid => {
      self.app.tokenRedis.get(init_token).then(result => {
        if (!result) return next({ code: 404, error: 'init_token expired or no exists' });

        const json = JSON.parse(result);
        console.log('result:::::::::::::', result);
        let { uid } = json;
        // var sessionService = self.app.get('sessionService');

        // uid += `*${cid}`;
        client && (uid += `*${client}`);
        //duplicate log in
        // if (!!sessionService.getByUid(uid)) {
        //   console.log('rrrrrrrrrrrrrrrr')
        //   next(null, {
        //     code: 500,
        //     error: true
        //   });
        //   return;
        // }

        session.bind(uid);
        session.set('cid', cid);
        session.push('cid', function(err) {
          if (err) {
            console.error('set cid for session service failed! error is : %j', err.stack);
          }
        });

        // console.log(session.__session__.__socket__)
        // session.__session__.__socket__.on('disconnect', function() {
        //   console.log('disconnect,disconnect,disconnect');
        // })
        session.on('closed', onUserLeave.bind(null, self.app, session, userLeaveCallback.bind(self, client, uid, next)));
        //put user into channel
        self.app.rpc.chat.chatRemote.add(session,
          uid,
          self.app.get('serverId'),
          cid,
          true,
          function(err, result) {

            // let { users, members } = result;
            let { channel_id } = result;
            self.app.rpc.account.accountRemote.getChannelId(session, uid, function(err, lastcid) {
              new Promise((resolve, reject) => {
                if (lastcid && (lastcid !== cid)) {
                  console.log('lastcid::::::::::::', lastcid, self.app.get('serverId'));
                  // console.log(console.log(Object.keys(self.app.settings)));

                  self.app.rpc.channel.channelRemote.kickChannel(session, uid, lastcid, self.app.get('serverId'), function(err) {

                    console.log('channel error2:::::::::', err);
                    // cb && cb();
                    resolve({
                      channel_id,
                      // users,
                      // members
                    });
                  });
                } else {
                  resolve({
                    channel_id,
                    // users,
                    // members
                  });
                }
              }).then(res => {
                self.app.rpc.account.accountRemote.setChannelId(session, uid, cid, function(err, status) {
                  if (err) return next(err);console.log(res);
                  sup_requestCollection
                    .count()
                    .then(count =>{
                      res.count = count;console.log('resresresres::::::::',res);
                      next(null, res);
                    });
                });
              }).catch(next);
            });
          });

      }).catch(e => {
        console.error(e);
        next({ error: 'server redis error' });
      });
    });
  };

  /**
   * User log out by self
   */
  kick(msg, session, next) {
    let self = this;
    let [uid, client] = session.uid.split('*');
    onUserLeave(self.app, session, userLeaveCallback.bind(self, client, uid, next));
  };
}

var userLeaveCallback = function(client, uid, next) {
  if (client) {
    return this.app.rpc.account.accountRemote.revokeDeviceToken(null, { uid }, function() {
      next(null, {});
    });
  }

  next(null, {});
};

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
  var uid = session.uid;
  app.rpc.account.accountRemote.getChannelId(session, uid, function(err, channelId) {
    app.rpc.account.accountRemote.unbindChannel(session, uid, function() {
      app.rpc.channel.channelRemote.kickChannel(session, uid, channelId, app.get('serverId'), cb || null);
    });
  });
};
