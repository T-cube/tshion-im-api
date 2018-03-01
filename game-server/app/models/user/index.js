'use strict';
const _ = require('../../../libs/util');

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const tlf_db = app.tlf_db;
  const db = app.db;
  const userCollection = tlf_db.collection('user');
  const requestCollection = db.collection('friend.request');
  const friendCollection = db.collection('friend');
  const friendGroupCollection = db.collection('friend.group');


  const STATUS_FRIEND_REQUEST_PADDING = 'STATUS_FRIEND_REQUEST_PADDING';
  const STATUS_FRIEND_REQUEST_AGREE = 'STATUS_FRIEND_REQUEST_AGREE';
  const STATUS_FRIEND_REQUEST_REJECT = 'STATUS_FRIEND_REQUEST_REJECT';
  const STATUS_FRIEND_REQUEST_IGNORE = 'STATUS_FRIEND_REQUEST_IGNORE';
  return class User {

    /**
     * 获取用户详情
     * @param {*} user_id
     */
    static user(user_id) {
      return userCollection.findOne({ _id: ObjectID(this.user) }, {
        name: 1,
        mobile: 1,
        age: 1,
        birthday: 1,
        email: 1,
        sex: 1,
        avatar: 1
      });
    }

    /**
     * 查找用户
     * @param {*} param0
     * @param {String} param0.user 发起查找的用户
     */
    static find({ name, mobile, email, keyword, user }) {
      var query = {};
      var $or = [];
      if (name) {
        query['name'] = { $regex: name, $options: 'g' };
      }
      if (mobile) {
        query['mobile'] = { $regex: mobile, $options: 'g' };
      }
      if (email) {
        query['email'] = { $regex: email, $options: 'g' };
      }
      if (keyword) {
        if (_.isEmail(keyword)) {
          $or.push({ email: { $regex: keyword, $options: 'g' } });
        } else if (_.isMobile(mobile)) {
          $or.push({ mobile: { $regex: keyword, $options: 'g' } });
        } else {
          $or.push({ name: { $regex: keyword, $options: 'g' } });
          if (_.isNumber(keyword)) {
            $or.push({ mobile: { $regex: keyword, $options: 'g' } });
          }
        }
      }
      if ($or.length) {
        query['$or'] = $or;
      }
      if (!Object.getOwnPropertyNames(query).length) return Promise.resolve([]);

      return friendCollection.findOne({ user: ObjectID(user) }).then(doc => {
        let friends = [];
        if (doc) {
          friends = doc.friends;
        }

        if (friends.length) {
          query['$nor'] = friends.map(_id => ({ _id }));
        }
        return userCollection.find(query, { avatar: 1, email: 1, mobile: 1, name: 1, sex: 1 }).toArray();
      });
    }

    /**
     * 发送添加好友请求
     * @param {*} param0
     */
    static sendRequest({ user_id, from, mark }) {
      return requestCollection.findOne({ receiver: user_id, from, status: STATUS_FRIEND_REQUEST_AGREE }).then(doc => {
        if (doc) return null;

        return requestCollection.findOne({ receiver: user_id, from }).then(doc => {
          if (doc && (doc.status != STATUS_FRIEND_REQUEST_IGNORE) && (doc.status != STATUS_FRIEND_REQUEST_REJECT)) return User._updateFriendRequest({
              receiver: user_id,
              from,
              status: doc.status
            }, {
              mark,
              update_at: new Date
            })
            .then(() => {
              return null;
            });
          let data = { receiver: user_id, from, mark, create_at: new Date, status: STATUS_FRIEND_REQUEST_PADDING };
          return requestCollection.insertOne(data).then(value => {
            data._id = value.insertedId;
            return data;
          });
        });
      });
    }

    /**
     * 更新好友请求
     * @param {*} query
     * @param {*} data
     */
    static _updateFriendRequest(query, data) {
      return requestCollection.findOneAndUpdate(query, { $set: data }, { upsert: false }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    /**
     * 获取好友请求
     * @param {*} query
     */
    static getFriendRequest(query) {
      return requestCollection.find(query).sort({ create_at: -1, update_at: -1 }).toArray().then(docs => {
        let froms = docs.map(doc => ObjectID(doc.from));

        return userCollection.find({ _id: { $in: froms } }, { name: 1, avatar: 1 }).toArray().then(users => {
          return docs.map((doc, index) => ({...users.find(user => user._id.toString() == doc.from), ...doc }));
        });
      });
    }

    /**
     * 拒绝好友请求
     * @param {*} request_id
     */
    static _rejectFriendRequest(request_id) {
      return User._updateFriendRequest({ _id: ObjectID(request_id) }, { status: STATUS_FRIEND_REQUEST_REJECT });
    }

    /**
     * 添加好友
     * @param {*} query
     * @param {*} friends
     */
    static _addFriend(query, friends) {
      if (friends instanceof Array) {
        friends = { $each: friends }
      }

      return friendCollection.findOneAndUpdate(query, {
        $set: query,
        $addToSet: {
          friends
        }
      }, { upsert: true }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    /**
     * 往好友分组里添加好友
     * @param {*} query
     * @param {*} friends
     */
    static _addGroupFriend(query, friends) {
      if (friends instanceof Array) {
        friends = { $each: friends }
      }

      return friendGroupCollection.findOneAndUpdate(query, {
        $set: query,
        $addToSet: {
          members: friends
        }
      }, { upsert: true }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    /**
     * 同意好友请求
     * @param {*} request_id
     */
    static _agreeFriendRequest(request_id) {
      return requestCollection.findOne({ _id: ObjectID(request_id) }).then(request => {
        if (!request) throw new Error('request not found');

        let { from: user_a, receiver: user_b } = request;
        user_a = ObjectID(user_a), user_b = ObjectID(user_b);

        let promise_a = User._addFriend({ user: user_a }, user_b);
        let promise_a_group = User._addGroupFriend({ user: user_a, type: 'default' }, user_b);

        let promise_b = User._addFriend({ user: user_b }, user_a);
        let promise_b_group = User._addGroupFriend({ user: user_b, type: 'default' }, user_a);

        let promise_request = User._updateFriendRequest({ _id: ObjectID(request_id) }, { status: STATUS_FRIEND_REQUEST_AGREE });

        return Promise.all([promise_a, promise_a_group, promise_b, promise_b_group, promise_request]).then(() => {
          return { result: 'ok' };
        });
      });
    }

    /**
     * 处理好友请求
     * @param {*} status
     * @param {*} request_id
     */
    static handleFriendRequest(status, request_id) {
      if (status == 'reject') return User._rejectFriendRequest(request_id);
      if (status == 'agree') return User._agreeFriendRequest(request_id);
      return Promise.reject('');
    }

    static getFriendGroupList(user_id) {
      return friendGroupCollection.find({ user: ObjectID(user_id) }, { name: 1, type: 1 }).toArray();
    }

    /**
     * 用 id 数组查找多个用户信息
     * @param {*} _ids
     */
    static _getUserInfoByIds(_ids) {
      return userCollection.find({ _id: { $in: _ids } }, { avatar: 1, name: 1, mobile: 1, email: 1, sex: 1, birthday: 1 }).toArray();
    }

    /**
     * 获取分组好友信息
     * @param {*} group_id
     */
    static getGroupFriendsInfo(group_id) {
      return friendGroupCollection.findOne({ _id: ObjectID(group_id) }).then(result => {
        return User._getUserInfoByIds(result.members);
      });
    }

    /**
     * 获取所有好友信息
     * @param {*} user_id
     */
    static getAllFriendsInfo(user_id) {
      return friendCollection.findOne({ user: ObjectID(user_id) }).then(result => {
        return User._getUserInfoByIds(result.friends);
      });
    }

    /**
     * 获取好友列表
     * @param {*} user_id
     */
    static getFriends(user_id) {
      return Promise.all([
        friendCollection.findOne({ user: ObjectID(user_id) }),
        User.getFriendGroupList(user_id)
      ]).then(([friends, groups]) => {
        friends.groups = groups;
        return friends;
      })
    }
  };
};
