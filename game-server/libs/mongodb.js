'use strict';
const { ObjectID, MongoClient } = require('mongodb');

module.exports = function(config) {
  let { mongodb, tlf_db } = config;
  return Promise.all([
    new Promise((resolve, reject) => {
      MongoClient.connect(`mongodb://${mongodb.host || '127.0.0.1'}:${mongodb.port || 27017}/${mongodb.db || 'test'}`, (err, db) => {
        if (err) return reject(err);
        if (mongodb.user) {
          db.authenticate(mongodb.user, mongodb.password, function(err, result) {
            if (err) return reject(err);
            console.log(result);
            resolve({ ObjectID, db });
          });
        } else {
          resolve({ ObjectID, db });
        }
      });
    }),
    new Promise((resolve, reject) => {
      MongoClient.connect(`mongodb://${tlf_db.host}:${tlf_db.port}/${tlf_db.db}`, (err, db) => {
        if (err) return reject(err);
        resolve(db);
      });
    })
  ]);
};
