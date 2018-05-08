'use strict';


module.exports = function (app) {
  const ObjectID = app.get('ObjectID');
  const groupMemberCollection = app.db.collection('chat.group.member');

  const User = require('../user')(app);
  const {MemberType, MemberStatus} = require('../../shared/constant');

  const defaultInfo = {
    type: MemberType.normal,
    status: MemberStatus.normal,
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
      return groupMemberCollection.find(query, Object.assign({name: 1, avatar: 1}, fields)).toArray();
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
      return groupMemberCollection.find({uid: uid}, {group: 1}).toArray();
    }

    /**
     * get member list by group id
     * @param {String} group
     * @returns {Promise}
     */
    static getMembersByGroupId(group) {
      return groupMemberCollection.find({group: ObjectID(group)}, {
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
      return Member._find({_id}, {
        group: 1,
        uid: 1,
        name: 1,
        avatar: 1,
        create_at: 1,
        update_at: 1,
        type: 1,
        status: 1
      }).then(member => {
        return User.findUser({id: member.uid}, {name: 1, avatar: 1}).then(user => {
          delete user._id;
          member = Object.assign(member, user);

          return Member._update({_id}, {$set: member}).then(result => member);
        });
      });
    }

    static updateById(_id, data) {
      let query = {_id: ObjectID(_id)};

      return Setting._update(query, {$set: data});
    }

    /**
     * 统计群里面成员总数
     * @param {String} group_id
     * @returns {Promise}
     */
    static memberCount(group_id) {
      return groupMemberCollection.count({group: ObjectID(group_id)});
    }

    /**
     * 获取群成员
     * @param {String} group_id
     * @returns {Promise}
     */
    static findMember(group_id) {
      return groupMemberCollection.find({group: ObjectID(group_id)}).toArray();
    }

    static _insertMany(members) {
      return groupMemberCollection.insertMany(members).then(result => result.insertedIds);
    }

    static getMembers(group_id) {
      return Member._find({group: ObjectID(group_id)});
    }

    /**
     * delete group members
     * @param {Array} memberIds
     * @returns {Promise}
     */
    static deleteMembers(memberIds, group_id) {
      let ids = memberIds;
      return groupMemberCollection.deleteMany({
        uid: {$in: ids},
        group: ObjectID(group_id)
      }).then(result => result.deletedCount);
    }

    /**
     * delete group all members
     * @param {Array} memberIds
     * @returns {Promise}
     */
    static deleteGroup(group_id) {
      return groupMemberCollection.deleteMany({
        group: ObjectID(group_id)
      }).then(result => result.deletedCount);
    }

    /**
     * 设置群成员类型
     * @param group_id
     * @param uid
     * @param type
     */
    static setMemberType(group_id, uid, type) {
      return groupMemberCollection.updateOne({group: ObjectID(group_id), uid: uid}, {$set: {type: type}});
    }

    /**
     * add many members to group
     * @param {Array} memberIds
     * @param {String|ObjectID} group
     * @returns {Promise}
     */
    static addMany(memberIds, group) {
      let ids = memberIds.sort();

      group = ObjectID(group);
      console.log('ids', ids);

      if (ids.length > 20) {
        return Promise.reject(new Error('add max 20 members once'));
      }

      return Member.memberCount(group).then(member_count => {
        console.log('member_count', member_count);
        if ((member_count + ids.length) > 100) {
          throw new Error('members out of limit, max member number is 100');
        }
        return User.findMany({id: {$in: ids}}).then(members => {
          console.log('members', members);
          return Member._insertMany(members.map(member => {
            var id = member.id;
            delete member.id;
            return Object.assign(member, defaultInfo, {create_at: new Date, uid: String(id), group});
          }));
        });
      });
    }

    /**
     * 保存新成员
     * @returns {Promise}
     */
    save() {
      let {group, uid} = this;
      return User.findUser({id: uid}, {avatar: 1, name: 1}).then(user => {
        delete user._id;
        let query = {group: group, uid: uid};
        return this._update(query, {$set: Object.assign(this, user)}, {upsert: true});
      });
    }
  };
};
