'use strict';
const { ObjectID, MongoClient } = require('mongodb');

module.exports = function(config) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(`mongodb://${config.host || '127.0.0.1'}:${config.port || 27017}/${config.db || 'test'}`, (err, db) => {
      if (err) return reject(err);
      if (config.user) {
        db.authenticate(config.user, config.password, function(err, result) {
          if (err) return reject(err);
          console.log(result);
          resolve({ ObjectID, db });
        });
      } else {
        resolve({ ObjectID, db });
      }
    });
  });
};
