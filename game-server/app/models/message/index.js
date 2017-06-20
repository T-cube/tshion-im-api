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

    save() {
      return MessageCollection.insertOne(this);
    }

    static saveMany(messages, offline = false) {
      if (offline)
        return Promise.all([MessageCollection.insert(messages), OfflineMessageCollection.insert(messages)]);

      return MessageCollection.insert(messages);
    }

    saveOffline() {
      let self = this;
      return OfflineMessageCollection.insertOne(self);
    }

    static getList(query) {
      let { roomid, pagesize = 20, last } = query;
      return Promise.all([MessageCollection.find(last && {
        roomid,
        _id: {
          '$lt': app.ObjectID(last)
        }
      } || {
        roomid
      }, {}).sort({
        timestamp: -1
      }).limit(pagesize).toArray().then(docs => {
        return {
          list: docs.reverse(),
          last: docs[0] && docs[0]._id || 0,
        };
      })]).then(results => {
        return results[0];
      });
    }

    static offlineMessageCount(query) {
      let { target } = query;
      return OfflineMessageCollection.group({ from: true, roomid: true }, { target }, { count: 0 }, function(curr, result) { result.count++; }, true);

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
      return OfflineMessageCollection.remove({ roomid, target });
    }
  };
};
