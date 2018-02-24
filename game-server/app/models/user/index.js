'use strict';
const _ = require('../../../libs/util');

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const tlf_db = app.tlf_db;
  const db = app.db;
  const userCollection = tlf_db.collection('user');
  const requestCollection = db.collection('friend.request');
  const friendCollection = db.collection('friend');


  const STATUS_FRIEND_REQUEST_PADDING = 'STATUS_FRIEND_REQUEST_PADDING';
  const STATUS_FRIEND_REQUEST_AGREE = 'STATUS_FRIEND_REQUEST_AGREE';
  const STATUS_FRIEND_REQUEST_REJECT = 'STATUS_FRIEND_REQUEST_REJECT';
  const STATUS_FRIEND_REQUEST_IGNORE = 'STATUS_FRIEND_REQUEST_IGNORE';
  return class User {
    /**
     * 查找用户
     * @param {*} param0
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
          if (doc && (doc.status != STATUS_FRIEND_REQUEST_IGNORE) && (doc.status != STATUS_FRIEND_REQUEST_REJECT)) return requestCollection.update({
            receiver: user_id,
            from
          }, {
            $set: {
              mark,
              update_at: new Date
            }
          }).then(() => {
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

    static getFriendRequest(query) {
      return requestCollection.find(query).toArray().then(docs => {
        let froms = docs.map(doc => ObjectID(doc.from));

        return userCollection.find({ _id: { $in: froms } }, { name: 1, avatar: 1 }).toArray().then(users => {
          return docs.map((doc, index) => ({...users[index], ...doc }));
        });
      });
    }
  };
};
