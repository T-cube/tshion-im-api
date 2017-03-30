'use strict';

const _ = require('../../../libs/util'),
  schema = require('./schema');

module.exports = function(app) {
  const groupCollection = app.db.collection('group');

  return class Group {
    constructor(info) {
      _.extend(info, this, schema);
    }

    save() {
      if (!this.group) return Promise.reject('group can be null');
      if (!this.members || this.members.length < 2) return Promise.reject('group members must be more then 2 people');

      return groupCollection.insertOne(this);
    }

    static exists(group) {
      return groupCollection.findOne({ group }, { date_create: 1, roomid: 1 });
    }

    static insertMembers(query) {
      let { creator, group, members } = query;
      return groupCollection.findOne({ creator, group }).then(doc => {
        if (!doc) throw new Error('only creator can add members');

        return groupCollection.findOneAndUpdate({ group }, { $addToSet: { members: { $each: members } } }, {
          projection: { members: 1, group: 1 },
          returnOriginal: false,
          returnNewDocument: true
        }).then(result => {
          return result.value;
        });
      });
    }

    static removeMembers(query) {
      let { creator, group, members } = query;

      return groupCollection.findOne({ creator, group }).then(doc => {
        if (!doc) throw new Error('only creator can remove member');

        return groupCollection.findOneAndUpdate({ group, creator }, { $pullAll: { members } }, {
          projection: { members: 1, group: 1 },
          returnOriginal: false,
          returnNewDocument: true
        }).then(result => {
          return result.value;
        });
      });
    }
  };
};
