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

    saveOffline() {
      let self = this;
      return Promise.all([MessageCollection.insertOne(self), OfflineMessageCollection.insertOne(self)]);
    }

    static list(query) {
      let { page = 0, pagesize = 20, roomid } = query;
      return Promise.all([MessageCollection.find({ roomid }).sort({ timestamp: -1 }).skip(page * pagesize).limit(pagesize).toArray(), OfflineMessageCollection.count({ roomid })]).then(results => {
        let result = {
          offline_message_count: results[1] || 0,
          list: (results[0] || []).reverse(),
        };
        return result;
      });
    }

    static getList(query) {
      let { roomid, pagesize = 20, last } = query;
      return MessageCollection.find(last && {
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
      });
    }

    static offlineMessageCount(query) {
      let { target } = query;
      return OfflineMessageCollection.group({ from: true }, { target }, { count: 0 }, function(curr, result) { result.count++; }, true);

    };
  };
};
