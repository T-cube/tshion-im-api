'use strict';
const _ = require('../../../libs/util');
const FriendInfoSchema = require('./friend-info');

module.exports = function(app) {
  const Room = require('../room')(app);

  const ObjectID = app.get('ObjectID');

  const tlf_db = app.tlf_db;
  const db = app.db;

  const userCollection = tlf_db.collection('user');
  const requestCollection = db.collection('friend.request');
  const friendCollection = db.collection('friend');
  const friendInfoCollection = db.collection('friend.info');
  const friendGroupCollection = db.collection('friend.group');
  const sup_requestCollection = db.collection('friend.sup_request');

  const STATUS_FRIEND_REQUEST_PADDING = 'STATUS_FRIEND_REQUEST_PADDING';
  const STATUS_FRIEND_REQUEST_AGREE = 'STATUS_FRIEND_REQUEST_AGREE';
  const STATUS_FRIEND_REQUEST_REJECT = 'STATUS_FRIEND_REQUEST_REJECT';
  const STATUS_FRIEND_REQUEST_IGNORE = 'STATUS_FRIEND_REQUEST_IGNORE';
  return class User {

    /**
     * 获取用户指定信息
     * @param {{}} query
     * @param {{}} fields
     */
    static findUser(query, fields) {
      return userCollection.findOne(query, fields);
    }

    /**
     * 获取用户详情
     * @param {*} user_id
     */
    static user(user_id, user) {
      return Promise.all([
        userCollection.findOne({
          _id: ObjectID(user_id)
        }, {
          name: 1,
          mobile: 1,
          age: 1,
          birthday: 1,
          email: 1,
          sex: 1,
          avatar: 1
        }),
        friendInfoCollection.findOne({
          user: ObjectID(user),
          friend: ObjectID(user_id)
        }, {
          _id: 0,
          friend: 0,
          user: 0
        })
      ]).then(([info, friend]) => {
        console.log(info, friend)
        info = Object.assign(info, friend || {});
        return info;
      });
    }

    /**
     * 查找多个用户
     * @param {{}} query
     * @param {{}} fields
     * @returns {Promise}
     */
    static findMany(query, fields) {
      return userCollection.find(query, Object.assign({
          name: 1,
          avatar: 1
        }, fields))
        .sort({ _id: 1 })
        .toArray();
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
        query['name'] = {
          $regex: name,
          $options: 'g'
        };
      }
      if (mobile) {
        query['mobile'] = {
          $regex: mobile,
          $options: 'g'
        };
      }
      if (email) {
        query['email'] = {
          $regex: email,
          $options: 'g'
        };
      }
      if (keyword) {
        if (_.isEmail(keyword)) {
          $or.push({
            email: {
              $regex: keyword,
              $options: 'g'
            }
          });
        } else if (_.isMobile(mobile)) {
          $or.push({
            mobile: {
              $regex: keyword,
              $options: 'g'
            }
          });
        } else {
          $or.push({
            name: {
              $regex: keyword,
              $options: 'g'
            }
          });
          if (_.isNumber(keyword)) {
            $or.push({
              mobile: {
                $regex: keyword,
                $options: 'g'
              }
            });
          }
        }
      }
      if ($or.length) {
        query['$or'] = $or;
      }
      if (!Object.getOwnPropertyNames(query).length)
        return Promise.resolve([]);

      return friendCollection
        .findOne({ user: ObjectID(user) })
        .then(doc => {
          let friends = [];
          if (doc) {
            friends = doc.friends;
          }
          query['$nor'] = [];
          if (friends.length) {
            query['$nor'] = friends.map(_id => ({ _id }));
          }

          query['$nor'].push({ _id: ObjectID(user) });
          return userCollection
            .find(query, {
              avatar: 1,
              email: 1,
              mobile: 1,
              name: 1,
              sex: 1
            })
            .toArray();
        });
    }

    /**
     * 发送添加好友请求
     * @param {*} param0
     */
    static sendRequest({ user_id, from, mark }) {
      let flag = false;
      return friendCollection
        .findOne({ user: ObjectID(from)})
        .then( friends =>{
          if(friends){
            for(let i in friends.friends){
              if(friends.friends[i] == user_id){
                flag=true;
              }
            }
          }

          return Promise.all([
            requestCollection.findOne({ receiver: ObjectID(user_id), from: ObjectID(from), status: STATUS_FRIEND_REQUEST_AGREE }),
            sup_requestCollection.findOne({ from: ObjectID(from), to: ObjectID(user_id) } )
          ])
            .then(([req, sup]) => {
              console.log(req ,sup, flag);
              if (sup || (req && flag)) {
                return null;
              }

              let sup_data = {
                from,
                to: ObjectID(user_id),
                view_status: 0
              };

              return sup_requestCollection
                .insertOne(sup_data)
                .then(result => {
                  return sup_requestCollection
                    .find({to: sup_data.to, view_status: 0})
                    .count()
                    .then(count => {
                      let receiver = ObjectID(user_id);
                      return requestCollection
                        .findOne({ receiver, from })
                        .then(doc => {
                          if (doc && (doc.status != STATUS_FRIEND_REQUEST_IGNORE) && (doc.status != STATUS_FRIEND_REQUEST_REJECT)) {
                            return User._updateFriendRequest({
                              receiver,
                              from,
                              status: doc.status
                            }, { mark, update_at: new Date, status: req ? STATUS_FRIEND_REQUEST_PADDING : doc.status });

                          } else {

                            let data = {
                              receiver,
                              from,
                              mark,
                              create_at: new Date,
                              status: STATUS_FRIEND_REQUEST_PADDING
                            };
                            return requestCollection
                              .insertOne(data)
                              .then(value => {
                                data._id = value.insertedId;
                                data.count = count;
                                return data;
                              });
                          }
                        });
                    });
                });
            });
        });
    }

    /**
     * delete friend request
     * @param {String} request_id
     * @param {{}} receiver
     * @returns {Promise}
     */
    static deleteRequest(request_id, receiver) {
      return requestCollection.remove({ _id: ObjectID(request_id), receiver });
    }

    /**
     * 更新好友请求
     * @param {*} query
     * @param {*} data
     */
    static _updateFriendRequest(query, data) {
      return requestCollection.findOneAndUpdate(query, {
        $set: data
      }, {
        upsert: false
      }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    /**
     * 获取好友请求
     * @param {{}} query
     * @returns {Promise}
     */
    static getFriendRequest(query, {
      page = 0,
      pagesize = 20
    }) {
      pagesize = parseInt(pagesize);
      page = parseInt(page);

      return sup_requestCollection
        .update({to: ObjectID(query.receiver), view_status: 0},{$set:{view_status: 1}},{multi:true})
        .then(result =>{
          return requestCollection
            .find(query)
            .sort({ create_at: -1, update_at: -1 })
            .skip(page * pagesize)
            .limit(pagesize)
            .toArray()
            .then(docs => {
              let froms = docs.map(doc => ObjectID(doc.from));

              return userCollection.find({
                  _id: {
                    $in: froms
                  }
                }, {
                  name: 1,
                  avatar: 1,
                  mobile: 1
                })
                .toArray()
                .then(users => {
                  return docs.map((doc, index) => ({
                    ...users.find(user => user._id.toString() == doc.from),
                    ...doc
                  }));
                });
            });
        });
    }

    /**
     * 拒绝好友请求
     * @param {String} request_id
     * @param {String} receiver
     * @returns {Promise}
     */
    static _rejectFriendRequest(request_id, receiver) {
      return User._updateFriendRequest({
        _id: ObjectID(request_id),
        receiver
      }, { status: STATUS_FRIEND_REQUEST_REJECT });
    }

    /**
     * 添加好友
     * @param {{}} query
     * @param {String[]} friends
     * @returns {Promise}
     */
    static _addFriend(query, friends) {
      if (friends instanceof Array) {
        friends = {
          $each: friends
        }
      }

      return friendCollection.findOneAndUpdate(query, {
        $set: query,
        $addToSet: {
          friends
        }
      }, {
        upsert: true
      }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    /**
     * 往好友分组里添加好友
     * @param {{}} query
     * @param {String[]} friends
     * @returns {Promise}
     */
    static _addGroupFriend(query, friends) {
      if (friends instanceof Array) {
        friends = {
          $each: friends
        }
      }

      return friendGroupCollection.findOneAndUpdate(query, {
        $set: query,
        $addToSet: {
          members: friends
        }
      }, {
        upsert: true
      }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    /**
     * 创建好友关系
     * @param {ObjectID} user
     * @param {ObjectID} friend
     * @returns {Promise}
     */
    static _createFriend(user, friend) {
      let query = {
        user,
        friend
      };

      var friendInfo = new FriendInfoSchema({ nickname: '' });

      return friendInfoCollection.findOneAndUpdate(query, {
        $set: Object.assign(query, friendInfo)
      }, {
        upsert: true,
        returnOriginal: false
      });
    }

    /**
     * 修改好友信息
     * @param {String} friend
     * @param {String|ObjectID} user
     * @param {{}} info
     * @returns {Promise}
     */
    static updateFriendInfo(friend, user, info) {
      return friendInfoCollection.findOneAndUpdate({
        friend: ObjectID(friend),
        user: ObjectID(user)
      }, {
        $set: FriendInfoSchema(info)
      }, { returnOriginal: false });
    }

    /**
     * 同意好友请求
     * @param {String} request_id
     * @param {String} receiver
     * @returns {Promise}
     */
    static _agreeFriendRequest(request_id, receiver) {
      return requestCollection.findOne({ _id: ObjectID(request_id), receiver }).then(request => {
        if (!request)
          throw new Error('request not found');

        let { from: user_a, receiver: user_b } = request;
        user_a = ObjectID(user_a),
          user_b = ObjectID(user_b);

        let promise_a = User._addFriend({
          user: user_a
        }, user_b);
        let promise_a_group = User._addGroupFriend({
          user: user_a,
          type: 'default'
        }, user_b);
        let promise_a_info = User._createFriend(user_a, user_b);

        let promise_b = User._addFriend({
          user: user_b
        }, user_a);
        let promise_b_group = User._addGroupFriend({
          user: user_b,
          type: 'default'
        }, user_a);
        let promise_b_info = User._createFriend(user_b, user_a);

        let promise_request = User._updateFriendRequest({
          _id: ObjectID(request_id)
        }, { status: STATUS_FRIEND_REQUEST_AGREE });

        return Promise
          .all([
          promise_a,
          promise_a_group,
          promise_a_info,
          promise_b,
          promise_b_group,
          promise_request,
          promise_b_info
        ])
          .then(() => {
            return {
              result: 'ok',
              from: String(request.from),
              receiver: String(request.receiver)
            };
          });
      });
    }

    /**
     * 处理好友请求
     * @param {String[]} status
     * @param {String} request_id
     * @param {ObjectID} receiver
     * @returns {Promise}
     */
    static handleFriendRequest(status, request_id, receiver) {
      if (status == 'reject') {
        return requestCollection
          .findOne({_id: ObjectID(request_id)})
          .then(result =>{
            let from = result.from;
            let to = result.receiver;
            return sup_requestCollection
              .remove({from: from,to: to})
              .then(result =>{
                return User._rejectFriendRequest(request_id, receiver);
              });
          });
      }
      if (status == 'agree') {
        return requestCollection
          .findOne({_id: ObjectID(request_id)})
          .then(result =>{
            let from = result.from;
            let to = result.receiver;
            return sup_requestCollection
              .remove({from: from,to: to})
              .then(result =>{
                return User
                  ._agreeFriendRequest(request_id, receiver)
                  .then(result => {
                    let { from, receiver } = result;
                    const roomInfo = Room.createRoomInfo(from, receiver)

                    return new Room(roomInfo)
                      .save()
                      .then(() => {
                        return result;
                      });
                  });
              });
          });
      }
      return Promise.reject('');
    }

    static _countFriendGroup(user_id) {
      return friendGroupCollection.count({ user: ObjectID(user_id) });
    }

    /**
     * 创建好友分组
     * @param {String} name
     * @param {ObjectID} user
     * @returns {Promise}
     */
    static createFriendGroup(name, user) {
      return User
        ._countFriendGroup(user)
        .then(count => {
          if (count >= 50) {
            throw new Error('user friend\'s group number max 50');
          }
          let info = {
            name,
            user,
            members: [],
            type: 'custom'
          };
          return friendGroupCollection
            .insert(info)
            .then(res => {
              info._id = res.insertedId;
              return info;
            });
        });
    }

    /**
     * 获取用户好友分组列表
     * @param {String} user_id
     * @returns {Promise}
     */
    static getFriendGroupList(user_id) {
      return friendGroupCollection.find({
        user: ObjectID(user_id)
      }, {
        name: 1,
        type: 1
      }).toArray();
    }

    /**
     * 用 id 数组查找多个用户信息
     * @param {String[]} _ids
     */
    static _getUserInfoByIds(_ids) {
      return userCollection.find({
        _id: {
          $in: _ids
        }
      }, {
        avatar: 1,
        name: 1,
        mobile: 1,
        email: 1,
        sex: 1,
        birthday: 1
      }).toArray();
    }

    /**
     * 获取分组好友信息
     * @param {*} group_id
     */
    static getGroupFriendsInfo(group_id, user) {
      return friendGroupCollection.findOne({ _id: ObjectID(group_id), user: ObjectID(user) }).then(result => {
        if (!result)
          return [];
        return User
          ._getFriendsInfo(result.members, user)
          .then(members => {
            const uid = user.toString();
            return Promise.all(members.map(member => {
              return Room.findRoom({
                members: {
                  $all: [
                    member
                      ._id
                      .toHexString(),
                    uid
                  ]
                }
              }).then(room => {
                if (room) {
                  member.roomid = room.roomid;
                }
                return member;
              });
            }));
          });
      });
    }

    /**
     *
     * @param {Array} ids
     * @returns {Promise}
     */
    static _getFriendsInfo(ids, user) {
      user = ObjectID(user);
      return User
        ._getUserInfoByIds(ids)
        .then(users => {
          let query = users.map(member => member._id);

          return friendInfoCollection.find({
              friend: {
                $in: query
              },
              user
            }, {
              friend: 1,
              nickname: 1,
              settings: 1
            })
            .toArray()
            .then(friends => {
              return users.map((member) => {
                friends.find(console.log)
                let friend = friends.find(fr => { console.log(fr); return fr.friend.equals(member._id) });
                if (!friend)
                  return member;

                delete friend._id;
                // delete friend.friend;

                return Object.assign(member, friend, {
                  showname: friend.nickname ?
                    friend.nickname : member.name
                });
              });
            })
        });
    }

    /**
     * 获取所有好友信息
     * @param {*} user_id
     */
    static getAllFriendsInfo(user_id) {
      return friendCollection
        .findOne({ user: ObjectID(user_id) })
        .then(result => {
          if (!result) return [];
          return User._getFriendsInfo(result.friends, user_id);
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
        if (!friends) {
          return { groups: [] };
        }
        friends.groups = groups;
        return friends;
      })
    }


    /**
     * 删除指定好友
     * @param {String} user_id
     * @param {String} friend_id
     * @returns {Promise<any[]>}
     */
    static deleteFriend(user_id, friend_id) {
      var user = ObjectID(user_id);
      var friend = ObjectID(friend_id);
      return Promise.all([
        friendCollection.findOneAndUpdate({ user }, { '$pull': { friends: friend } }),
        friendCollection.findOneAndUpdate({ user: friend }, { '$pull': { friends: user } }),
        friendGroupCollection.findOneAndUpdate({ user, type: 'default' }, { '$pull': { members: friend } }),
        friendGroupCollection.findOneAndUpdate({ user: friend, type: 'default' }, { '$pull': { members: user } }),
        friendInfoCollection.findOneAndDelete({ user, friend }),
        friendInfoCollection.findOneAndDelete({ user: friend, friend: user })
      ]);
    }

    /**
     * get one friend info
     * @param {String} user
     * @param {String} friend
     * @returns {Promise}
     */
    static getFriendInfo(user, friend) {
      return friendInfoCollection.findOne({ user: ObjectID(user), friend: ObjectID(friend) });
    }

    /**
     * change one friend block status
     * @param {String} user
     * @param {String} friend
     * @param {Number} status
     * @returns {Promise}
     */
    static changeFriendBlockMode(user, friend, status) {
      return friendInfoCollection.findOneAndUpdate({
        user: ObjectID(user),
        friend: ObjectID(friend)
      }, { $set: { 'settings.block': status } }, {
        returnOriginal: false,
        upsert: false
      });
    }

    static changeFriendDistubMode(user, friend, status) {
      return friendInfoCollection.findOneAndUpdate({
        user: ObjectID(user),
        friend: ObjectID(friend)
      }, { $set: { 'settings.not_distub': status } }, {
        returnOriginal: false,
        upsert: false
      });
    }
  };
};
