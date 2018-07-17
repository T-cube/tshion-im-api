module.exports = function(app) {
  var Message = require('../../../models/message')(app);
  var User = require('../../../models/user')(app);

  var ObjectID = app.get('ObjectID');

  return {
    get: {
      'session': {
        docs: {
          name: '获取单聊会话列表',
          params: []
        },
        method(req, res, next) {
          var user = req.user;
          var uid = user._id.toHexString();

          Message.getOfflineMessageRoomsByTarget(uid).then(rooms => {
            var roomids = [],
              froms = [];
            rooms.forEach(room => {
              roomids.push(room.roomid);
              froms.push(ObjectID(room.from));
            });

            return Message.getLastMessageByRommids(roomids).then(messages => {
              return User.findMany({ _id: { $in: froms } }).then(users => {
                var result = rooms.map((room, index) => {
                  room.member = users[index];
                  room.message = messages[index];
                  delete room.roomid;
                  delete room.from;
                  return room;
                })
                res.sendJson(result);
              });
            });
          }).catch(next);
        }
      }
    }
  }
}
