'use strict';


module.exports = function(app) {
  const _ = require('../../../libs/util'),
    schema = require('./schema');

  const RoomCollection = app.db.collection('room');

  return class Room {
    constructor(info) {
      _.extend(info, this, schema);
    }

    save() {
      let self = this;

      return RoomCollection.findOne({ roomid: self.roomid }).then(doc => {
        if (doc) return doc;

        return RoomCollection.insertOne(self).then(result => {
          self._id = result.insertedId;
          return self;
        });
      });
    }

    static upgradeActive(room) {
      let { _id } = room;
      return RoomCollection.findOneAndUpdate({ _id }, { $set: { last_active: +new Date, actived: 1 } }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(doc => doc.value);
    }

    unActive(roomid) {
      return RoomCollection.findOneAndUpdate({ roomid }, { $set: { actived: 0 } }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(doc => doc.value);
    }

    static findRoom(query) {
      return RoomCollection.findOne(query);
    }


    /**
     * get user room map
     * @param {String} uid
     * @return {Promise}
     */
    static getUserRoomMap(uid, cid) {
      return RoomCollection.find({
        [`room.${uid}`]: cid,
        members: uid
      }).toArray().then(docs => docs);
    }
  };
};