'use strict';

const _ = require('../../../libs/util'),
  schema = require('./schema');

module.exports = function(app) {
  const RoomCollection = app.db.collection('room');

  return class Room {
    constructor(info) {
      _.extend(info, this, schema);
    }

    save() {
      let self = this;

      return RoomCollection.findOne({ roomid: self.roomid }).then(odc => {
        if (doc) return doc;

        return RoomCollection.insertOne(self).then(result => {
          self._id = result.insertedId;
          return self;
        });
      });
    }


    /**
     * get user room map
     * @param {String} uid
     * @return {Promise}
     */
    static getUserRoomMap(uid) {
      return RoomCollection.find({ members: uid }).toArray().then(docs => {
        return docs;
      });
    }
  };
};