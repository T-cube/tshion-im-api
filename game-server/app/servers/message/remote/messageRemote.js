'use strict';
module.exports = function (app) {
  return new MessageRemote(app);
};

var MessageRemote = function (app) {
  this.app = app;
  this.channelService = app.get('channelService');
  this.Message = require('../../../models/message')(app);
  this.Chat = require('../../../models/chat')(app);
  this.Member = require('../../../models/group/member')(app);
  this.groupRedis = app.groupRedis;
};

const prototype = MessageRemote.prototype;

prototype.insertOrUpdateMsg = async function (msg) {
  let _id = msg._id, res;
  if (_id) {
    let findMsg = await this.Message.getMessage(msg._id);
    if (!findMsg) {
      throw new Error("no found findMsg _id:" + msg._id);
    }
    msg.target = findMsg.uid1;
    msg = await this.Chat.insertOrUpdate(msg);
    res = await this.Message.updateMessage(_id, msg);
  }
  else {
    msg = await this.Chat.insertOrUpdate(msg);
    res = await (new this.Message(msg)).save();
  }
  return res;
};

prototype.insertGroupMsg = async function (msg) {
  let {group} = msg;
  let members = await this.getGroupInfo(group);
  if (!members) {
    throw new Error('群不存在');
  }
  if (members.every(itme => itme !== msg.from)) {
    throw new Error('用户不在群中无法法群消息');
  }
  for (let i = 0; i < members.length; i++) {
    msg.target = members[i];
    msg = await this.Chat.insertOrUpdate(msg);
  }
  await (new this.Message(msg)).save();
  msg.target = null;
  return {msg, members};
};

prototype.saveMessage = function (msg, cb) {

  this.insertOrUpdateMsg(msg).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
  })
};

prototype.saveGroupMessage = function (msg, cb) {
  this.insertGroupMsg(msg).then(res => {
    cb({code: 200, members: res.members, msg: res.msg});
  }).catch(e => {
    console.error(e);
    cb({code: 500, message: e.message});
  })
};

prototype.saveOfflineMessage = function (msg, cb) {
  new this.Message(msg).saveOffline().then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getOfflineMessage = function (target, cb) {
  this.Message.offlineMessageCount({target}).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};


// prototype.saveGroupMessage = function (msg, offlineMembers = [], cb) {
//   let self = this;
//
//   if (!offlineMembers.length) {
//     new self.Message(msg).save().then(result => {
//       cb(null, result);
//     }).catch(e => {
//       console.error(e);
//       cb(e);
//     });
//   }
//   else {
//     Promise.all([new self.Message(msg).save(), self.Message.saveMany(offlineMembers.map(target => {
//       return new self.Message(Object.assign(msg, {target}));
//     }), true)]).then(results => cb(null, results)).catch(e => {
//       console.error(e);
//       cb(e);
//     });
//   }
// };

prototype.getLastMessage = function (user, rooms, cb) {
  let self = this;

  self.Message.getLastMessage(rooms, user).then(results => {
    cb(null, results);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};

prototype.getMessage = function (message_id, cb) {
  this.Message.getMessage(message_id).then(message => cb(null, message)).catch(cb);
};

/**
 * 获取群信息，先从缓存中取缓存中没有从数据库取
 * @param groupId 群id
 * @param cb
 */
prototype.getGroupInfo = async function (groupId, cb) {
  let members = await this.groupRedis.smembers('members_' + groupId);
  if (!members || members.length === 0) {
    members = await this.Member.findMember(groupId);
    members = members.map(item => item.uid);
    for (let i = 0; i < members.length; i++) {
      await this.groupRedis.sadd('members_' + groupId, members[i]);
    }
  }
  return members;
};