'use strict';



module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const groupMemberCollection = app.db.collection('chat.group.member');

  const User = require('../user')(app);

  const defaultInfo = {
    type: 'normal',
    status: 'normal',
    create_at: new Date
  };

  return class Member {
    constructor(info) {
      Object.assign(this, defaultInfo, info);
    }

    static _update(query, data, options) {
      return groupMemberCollection.findOneAndUpdate(query, data, Object.assign({
        returnOriginal: false,
        returnNewDocument: true
      }, options)).then(result => result.value);
    }

    static _find(query, fields) {
      return groupMemberCollection.find(query, Object.assign({ name: 1, avatar: 1 }, fields)).toArray();
    }

    static _findOne(query, fields) {
      return groupMemberCollection.findOne(query, Object.assign({ name: 1, avatar: 1 }, fields));
    }

    _update() {
      return Member._update.apply(this, arguments);
    }


    /**
     * get user group ids
     * @param {String} uid
     * @returns {Promise}
     */
    static findGroupByUid(uid) {
      return groupMemberCollection.find({ uid: ObjectID(uid) }, { group: 1 }).toArray();
    }

    /**
     * get a group member by uid and group id
     * @param {String} uid
     * @param {String} group
     * @returns {Promise}
     */
    static findMemberByUidAndGroupId(uid, group) {
      return groupMemberCollection.findOne({ uid: ObjectID(uid), group: ObjectID(group) });
    }

    /**
     * get member list by group id
     * @param {String} group
     * @returns {Promise}
     */
    static getMembersByGroupId(group) {
      return groupMemberCollection.find({ group: ObjectID(group) }, {
        uid: 1,
        name: 1,
        avatar: 1,
        type: 1,
        status: 1
      }).toArray();
    }

    /**
     * 获取成员信息
     * @param {String} memberId
     */
    static getMemberInfo(memberId) {
      let _id = ObjectID(memberId);
      return Member._findOne({ _id }, {
        group: 1,
        uid: 1,
        name: 1,
        avatar: 1,
        create_at: 1,
        update_at: 1,
        type: 1,
        status: 1
      }).then(member => {
        return User.findUser({ _id: member.uid }, { name: 1, avatar: 1 }).then(user => {
          delete user._id;
          member = Object.assign(member, user);

          return Member._update({ _id }, { $set: member }).then(result => member);
        });
      });
    }

    /**
     * 保存新成员
     * @returns {Promise}
     */
    save() {
      let { group, uid } = this;
      uid = ObjectID(uid);
      return User.findUser({ _id: uid }, { avatar: 1, name: 1 }).then(user => {
        delete user._id;
        let query = { group: ObjectID(group), uid: ObjectID(uid) };
        return this._update(query, { $set: Object.assign(this, user) }, { upsert: true });
      });
    }

    static updateById(_id, data) {
      let query = { _id: ObjectID(_id) };

      return Setting._update(query, { $set: data });
    }

    static _insertMany(members) {
      return groupMemberCollection.insertMany(members).then(result => result.insertedIds);
    }

    /**
     * 统计群里面成员总数
     * @param {String} group_id
     * @returns {Promise}
     */
    static memberCount(group_id) {
      return groupMemberCollection.count({ group: ObjectID(group_id) });
    }

    static getMembers(group_id) {
      return Member._find({ group: ObjectID(group_id) }, { uid: 1 });
    }

    /**
     * delete group members
     * @param {Array} memberIds
     * @returns {Promise}
     */
    static deleteMembers(memberIds) {
      let ids = memberIds.map(_id => ObjectID(_id ? _id : undefined));
      return Member._find({ type: 'owner', _id: { $in: ids } }).then(members => {
        if (members.length) throw new Error('cannot remove owner from group');

        return groupMemberCollection.deleteMany({ _id: { $in: ids } }).then(result => result.deletedCount);
      });
    }

    /**
     * add many members to group
     * @param {Array} memberIds
     * @param {String|ObjectID} group
     * @returns {Promise}
     */
    static addMany(memberIds, group) {
      let ids = memberIds.sort().map(_id => ObjectID(_id));

      group = ObjectID(group);
      // console.log('ids', ids);

      if (ids.length > 20) {
        return Promise.reject(new Error('add max 20 members once'));
      }

      return Member.memberCount(group).then(member_count => {
        // console.log('member_count', member_count);
        if ((member_count + ids.length) > 100) {
          throw new Error('members out of limit, max member number is 100');
        }

        return Promise.all(ids.map(user => Member._findOne({ uid: user, group }, { _id: 1 }))).then(exists => {
          let _ids = [];
          exists.forEach((exist, index) => {
            if (!exist) _ids.push(ids[index]);
          });

          if (!_ids.length) return [];

          return User.findMany({ _id: { $in: _ids } }).then(members => {
            return Member._insertMany(members.map(member => {
              var _id = member._id;
              delete member._id;
              return Object.assign(member, defaultInfo, { create_at: new Date, uid: _id, group });
            }));
          });
        });
      });
    }
  };
};
