'use strict';

const crypto = require('crypto');

const _ = require('../../../libs/util'),
  schema = require('./schema');

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const groupCollection = app.db.collection('chat.group');

  const Member = require('./member')(app);
  const Setting = require('./setting')(app);
  const Room = require('../room')(app);

  return class Group {
    constructor(info) {
      let { name, creator } = info;

      creator = ObjectID(creator);
      // console.log(creator, typeof creator);
      _.extend({ name, creator, owner: creator }, this, schema);
    }

    save(members) {
      // console.log(this.creator);
      if (!this.name) return Promise.reject('name cant be null');
      if (!members || members.length < 2) return Promise.reject('group members must be more then 2 people');
      return Promise.all([
        groupCollection.insertOne(this).then(result => {
          this._id = result.insertedId;

          return new Member({ group: this._id, uid: this.creator, type: 'owner' }).save().then(() => this);
        }),
        new Room(Room.createGroupRoomInfo(this.roomid), 'group').save()
      ]).then(([group]) => group);
    }

    static findGroupByIdAndOwner(_id, owner) {
      return groupCollection.findOne({ _id: ObjectID(_id), owner: ObjectID(owner) });
    }

    static findOne(query) {
      return groupCollection.findOne(query);
    }

    /**
     * 获取某个用户所在的所有群组
     * @param {String} user_id
     * @returns {Promise}
     */
    static getListByUid(user_id) {
      var uid = ObjectID(user_id);

      return Member.findGroupByUid(uid).then(members => {
        var group_ids = members.map(member => member.group);

        return groupCollection.find({ _id: { $in: group_ids } }).toArray();
      });
    }

    static getUserGroupListByUid(user_id) {
      var uid = ObjectID(user_id);

      return Member.findUserGroupByUid(uid).then(members => {
        var group_ids = members.map(member => member.group);

        return groupCollection.find({ _id: { $in: group_ids } }).toArray();
      });
    }

    /**
     * get group info detail
     * @param {String} group_id
     * @returns {Promise}
     */
    static info(group_id) {
      return Promise.all([
        groupCollection.findOne({ _id: ObjectID(group_id) }),
        Setting.getSettingByGroupId(group_id),
        Member.memberCount(group_id)
      ]).then(([group, setting, member_count]) => {
        if (!group) {
          throw new Error('group no exist');
        }

        group.setting = setting;
        group.member_count = member_count;
        return group;
      });
    }

    static createRoomId(creator) {
      var str = creator + (+new Date);
      return crypto.createHash('md5').update(str).digest('hex');
    }

    static exists(group) {
      return groupCollection.findOne(group, { date_create: 1, roomid: 1 });
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

    static modifyGroupName(group, name) {
      return groupCollection.findOneAndUpdate({ _id: ObjectID(group) }, { $set: { name } }, {
        returnOriginal: false
      }).then(result => result.value);
    }

    static modifyGroupAvatar(group, avatar) {
      return groupCollection.findOneAndUpdate({ _id: ObjectID(group) }, { $set: { avatar } }, {
        returnOriginal: false
      }).then(result => result.value);
    }

    // discard
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

    /**
     * 退群
     * @param {any} user_id
     * @param {any} group_id
     * @returns {Promise}
     */
    static quit(user_id, group_id) {
      var uid = ObjectID(user_id);
      var group = ObjectID(group_id);

      return Member.quitGroup(uid, group);
    }
  };
};
