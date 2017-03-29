'use strict';

module.exports = function(app) {
  return new groupRemote(app);
};

const groupRemote = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
  this.Group = require('../../../models/group')(app);
};

const prototype = groupRemote.prototype;

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
