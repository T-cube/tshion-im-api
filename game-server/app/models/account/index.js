'use strict';

const schema = require('./schema'),
  _ = require('../../../libs/util');

module.exports = function(app) {
  const accountCollection = app.db.collection('account');

  return class Account {
    constructor(info) {
      console.log(info);
      _.extend(info, this, schema);
    }

    saveAccount() {
      console.log(this);
      return accountCollection.findOneAndUpdate({ uid: this.uid }, { $set: this }, { upsert: true }, {
        returnOriginal: false,
        returnNewDocument: true
      }).then(result => result.value);
    }

    static delDeviceToken({ uid }) {
      return accountCollection.findOneAndUpdate({ uid }, { $set: { deviceToken: '' } });
    }

    static getDeviceToken({ uid }) {
      return accountCollection.find({ uid }).toArray();
    }
  };

};