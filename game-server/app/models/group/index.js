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
      return groupCollection.findOne({ group }, { group: 1, date_create: 1 });
    }

    static insertMembers(query) {
      let { creator, group, members } = query;
      return groupCollection.findOne({ creator, group }).then(doc => {
        if (!doc) throw new Error('only creator can add members');

        return groupCollection.updateOne({ group }, { $addToSet: { members: { $each: members } } }, {}, { returnOriginal: true });
      });
    }

    static removeMembers(query) {
      let { creator, group, members } = query;

      return groupCollection.findOne({ creator, group }).then(doc => {
        if (!doc) throw new Error('only creator can remove member');

        return groupCollection.update({ group, creator }, { $pullAll: { members } }, {}, { returnOriginal: true });
      });
    }
  };
};
