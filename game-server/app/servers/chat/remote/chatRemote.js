module.exports = function(app) {
  return new ChatRemote(app);
};

var ChatRemote = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
ChatRemote.prototype.add = function(uid, sid, cid, flag, cb) {
  var channel = this.channelService.getChannel(cid, flag);
  var username = uid.split('*')[0];
  var param = {
    route: 'onAdd',
    user: username
  };
  channel.pushMessage(param);

  if (!!channel) {
    channel.add(uid, sid);
  }
  let self = this;
  this.app.rpc.account.accountRemote.login(null, uid, 123, function() {
    cb(self.get(cid, flag));
  });
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
ChatRemote.prototype.get = function(name, flag) {
  var users = [];
  var channel = this.channelService.getChannel(name, flag);
  if (!!channel) {
    users = channel.getMembers();
  }
  for (var i = 0; i < users.length; i++) {
    users[i] = users[i].split('*')[0];
  }
  return users;
};

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
ChatRemote.prototype.kick = function(uid, sid, name, cb) {
  var channel = this.channelService.getChannel(name, false);
  // leave channel
  if (!!channel) {
    channel.leave(uid, sid);
  }
  var username = uid.split('*')[0];
  var param = {
    route: 'onLeave',
    user: username
  };
  this.app.rpc.account.accountRemote.unbindChannel(null, username, function(err, status) {
    channel.pushMessage(param);
    cb();
  });
};
