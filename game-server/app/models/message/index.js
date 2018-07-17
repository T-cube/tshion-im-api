'use strict';
const _ = require('../../../libs/util'),
  schema = require('./schema');
module.exports = function(app) {
  const MessageCollection = app
    .db
    .collection('message');
  const OfflineMessageCollection = app
    .db
    .collection('message.offline');
  const ObjectID = app.get('ObjectID');

  return class Message {
    constructor(msg) {
      this.msg = schema(msg);
    }

    /**
     * 存储消息
     */
    save() {
      let message = this.msg;
      return MessageCollection
        .insertOne(message)
        .then(res => {
          message._id = res.insertedId;
          return message;
        });
    }

    /**
     * 存储多条消息
     * @param {*} messages
     * @param {*} offline
     */
    static saveMany(messages, offline = false) {
      if (offline)
        return Promise.all([
          MessageCollection.insert(messages),
          OfflineMessageCollection.insert(messages)
        ]);
      return MessageCollection.insert(messages);
    }

    /**
     * 存储离线消息
     */
    saveOffline() {
      let self = this;
      return OfflineMessageCollection.insertOne(self.msg);
    }

    static saveOfflineMessages(msgs) {
      // console.log(msgs);
      return OfflineMessageCollection.insertMany(msgs);
    }

    /**
     * 获取消息列表
     * @param {*} query
     */
    static getList(query) {
      let {
        roomid,
        pagesize = 20,
        last
      } = query;
      // console.log(roomid,11111)
      pagesize = parseInt(pagesize);
      return Promise.all([
        MessageCollection.find(last && {
          roomid,
          timestamp: {
            '$lt': parseInt(last)
          }
        } || {
          roomid
        }, {})
          .sort({ timestamp: -1 })
          .limit(pagesize)
          .toArray()
          .then(docs => {
          // console.log(docs);
          return {
            list: docs,
            // list: docs.reverse(),
            last: docs.length && docs[docs.length - 1].timestamp || 0
          };
        })
      ]).then(results => {
        return results[0];
      });
    }

    static getMessage(_id) {
      return MessageCollection.findOne({ _id: ObjectID(_id) });
    }

    static getNewLyList({ roomid, index }) {
      // console.log(index);
      if (!index)
        return Message.getList(roomid);

      // console.log(arguments);
      return MessageCollection.find({
          roomid,
          timestamp: {
            $gt: parseInt(index)
          }
        }, {})
        .sort({ timestamp: 1 })
        .toArray()
        .then(docs => docs.reverse());
    }

    static offlineMessageCountByRoomids(target, roomids) {
      return OfflineMessageCollection.group({
        roomid: true,
        target: true
      }, {
        target,
        roomid: {
          '$in': roomids
        }
      }, {
        count: 0
      }, function(curr, result) {
        result.count++;
      }, true);
    }

    static offlineMessageCount(query) {
      let { target } = query;
      // return OfflineMessageCollection.aggregate({
      //
      // })
      return OfflineMessageCollection.group({
        from: true,
        roomid: true
      }, {
        target
      }, {
        count: 0
      }, function(curr, result) {
        result.count++;
      }, true);
    }

    static getOfflineMessage(query) {
      return OfflineMessageCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(150)
        .toArray();
    }

    static getLastMessageByRommids(roomids) {
      return Promise
        .all(roomids.map(roomid => MessageCollection.find({ roomid }).limit(1).sort({ timestamp: -1 }).toArray()))
        .then(results => {
          var messages = results.map(result => result[0]);
          return messages;
        });
    }

    static getLastMessage(rooms, self) {
      return Promise
        .all(rooms.map(room => MessageCollection.find({ roomid: room.roomid }).limit(1).sort({ timestamp: -1 }).toArray()))
        .then(results => {
          let r = results.map((messages, index) => {
            let room = rooms[index];
            return {
              room,
              message: messages[0],
              target_id: room
                .members
                .find(m => m != self)
            };
          });
          return r;
        });
    }
    static deleteOfflineMessage(query) {
      let { roomid, target } = query;
      console.log(query, '................');
      return OfflineMessageCollection
        .count({ roomid, target })
        .then(count => {
          return OfflineMessageCollection
            .remove({ roomid, target })
            .then(() => count);
        });
    }

    static getOfflineMessageRoomsByTarget(target) {
      return OfflineMessageCollection.group({
        roomid: 1,
        from: 1
      }, {
        target,
        group: { '$exists': false }
      }, {
        _offline_count: 0
      }, function(curr, result) {
        result._offline_count++;
      }, true);
    }
  };

};
