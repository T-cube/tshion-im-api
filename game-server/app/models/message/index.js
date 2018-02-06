'use strict';
const _ = require('../../../libs/util'),
  schema = require('./schema');
module.exports = function(app) {
  const MessageCollection = app.db.collection('message');
  const OfflineMessageCollection = app.db.collection('message.offline');
  return class Message {
    constructor(msg) {
      _.extend(msg, this, schema);
    }

    /**
     * 存储消息
     */
    save() {
      return MessageCollection.insertOne(this);
    }

    /**
     * 存储多条消息
     * @param {*} messages
     * @param {*} offline
     */
    static saveMany(messages, offline = false) {
      if (offline) return Promise.all([MessageCollection.insert(messages), OfflineMessageCollection.insert(messages)]);
      return MessageCollection.insert(messages);
    }

    /**
     * 存储离线消息
     */
    saveOffline() {
      let self = this;
      return OfflineMessageCollection.insertOne(self);
    }

    /**
     * 获取消息列表
     * @param {*} query
     */
    static getList(query) {
      let { roomid, pagesize = 20, last } = query;
      // console.log(roomid,11111)
      pagesize = parseInt(pagesize);
      return Promise.all([MessageCollection.find(last && {
        roomid,
        timestamp: {
          '$lt': parseInt(last)
        }
      } || {
        roomid
      }, {}).sort({ timestamp: -1})
      .limit(pagesize).toArray().then(docs => {
        // console.log(docs);
        return {
          list: docs.reverse(),
          last: docs.length && docs[0].timestamp || 0,
        };
      })]).then(results => {
        return results[0];
      });
    }


    static getNewLyList({ roomid, index }) {
      // console.log(index);
      if (!index) return Message.getList(roomid);
      // console.log(arguments);
      return MessageCollection.find({ roomid, timestamp: { $gt: parseInt(index) } }, {}).sort({ timestamp: 1 }).toArray().then(docs => docs.reverse());
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
      },
        function(curr, result) { result.count++; }, true);
    };
    static getLastMessage(rooms) {
      return Promise.all(rooms.map(room => MessageCollection.find({ roomid: room.roomid }).limit(1).sort({ timestamp: -1 }).toArray())).then(results => {
        let r = results.map((messages, index) => {
          return { room: rooms[index], message: messages[0] };
        });
        return r;
      });
    }
    static deleteOfflineMessage(query) {
      let { roomid, target } = query;
      return OfflineMessageCollection.count({ roomid, target }).then(count => {
        return OfflineMessageCollection.remove({ roomid, target }).then(() => count);
      });
    }
  };
};
