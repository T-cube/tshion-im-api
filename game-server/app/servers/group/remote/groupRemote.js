'use strict';

module.exports = function(app) {
  return new groupRemote(app);
};

const groupRemote = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
  this.Group = require('../../../models/group')(app);
  this.Member = require('../../../models/group/member')(app);
};

const prototype = groupRemote.prototype;

prototype.getMemberIds = function(group, uid, cb) {
  this.Member.findMemberByUidAndGroupId(uid, group).then(member => {
    if (!member) return cb('user not in the group');
    if (member.status != 'normal') cb('user not in the group');

    return this.Member.getMembersByGroupId(group).then(members => {
      let uids = members
        .filter(mem => mem.status == 'normal')
        .map(mem => mem.uid.toHexString());
      cb(null, uids);
    });
  }).catch(cb);
};

prototype.getMembers = function(group, uid, cb) {
  this.Member.findMemberByUidAndGroupId(uid, group).then(member => {
    if (!member) return cb('user not in the group');

    return this.Member.getMembersByGroupId(group).then(members => {
      cb(null, members);
    });
  }).catch(next);
}


prototype.init = function(creator, group, members, cb) {
  let self = this;

  self.Group.exists(group).then(result => {
    if (result) return cb(null, result);

    return new self.Group({ creator, group, members }).save().then(inserted => {
      cb(null, { group, _id: inserted.insertedId });
    });
  }).catch(e => {
    console.error(e);
    cb(e);
  });

};

prototype.insertMembers = function(creator, group, members, cb) {
  let self = this;
  self.Group.insertMembers({ creator, group, members }).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};


prototype.removeMembers = function(creator, group, members, cb) {
  let self = this;
  self.Group.removeMembers({ creator, group, members }).then(result => {
    cb(null, result);
  }).catch(e => {
    console.error(e);
    cb(e);
  });
};
