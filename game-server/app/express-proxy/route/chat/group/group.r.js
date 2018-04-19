'use strict';

module.exports = function (app) {
  const ObjectID = app.get('ObjectID');
  const Group = require('../../../../models/group')(app);
  return {
    post: {
      '': {
        docs: {
          name: '创建聊天群组',
          params: [
            {key: 'creator', type: 'String'},
            {key: 'name', type: 'String'},
            {key: 'members', type: 'Array'}
          ]
        },
        method(req, res, next) {
          var body = req.body;

          var {creator, name, members} = body;
          if ((!members) || (!members.length)) {
            members = [ObjectID(creator)];
          }

          var roomid = Group.createRoomId(creator);

          new Group({name, creator, members, roomid}).save().then(group => {
            res.json(group);
          }).catch(next);
        }
      }
    }
  };
};
