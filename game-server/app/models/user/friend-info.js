'use strict';

const SchemaObject = require('schema-object');

const FriendInfoSchema = new SchemaObject({
  nickname: { type: String, default: '' },
  settings: new SchemaObject({
    not_distub: { type: Number, default: 0, enum: [0, 1] },
    block: { type: Number, default: 0, enum: [0, 1] }
  })
});

module.exports = function(info) {
  return new FriendInfoSchema(info).toObject();
};
