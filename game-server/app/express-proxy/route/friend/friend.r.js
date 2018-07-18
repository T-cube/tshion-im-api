module.exports = function(app) {

  const User = require('../../../models/user')(app);

  return {
    get: {
      'list': {
        docs: {
          name: '获取好友列表',
          params: []
        },
        method(req, res, next) {
          var user = req.user;

          User.getAllFriendsInfo(user._id).then(list => {
            res.sendJson(list);
          }).catch(next);
        }
      }
    }
  }
}
