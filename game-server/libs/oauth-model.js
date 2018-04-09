'use strict';

var { getUserInfoCache, getAccessTokenCache, setUserAccessTokenRelation } = require('./cache');

module.exports = function(app) {
  const tlf_db = app.tlf_db;

  const userCollection = tlf_db.collection('user');
  const accesstokenCollection = tlf_db.collection('oauth.accesstoken');

  return {
    getAccessToken(bearerToken, callback) {
      console.log(bearerToken)
      // console.log('# getAccessToken (bearerToken: ' + bearerToken + ')');
      getAccessTokenCache(bearerToken).then(info => {
        console.log(info);
        if (info) {
          return getUserInfoCache(info.user_id).then(user => {
            user._id = ObjectID(user._id);
            info.user = user;
            return callback(null, info);
          });
        } else {
          // find access is exists
          return accesstokenCollection.findOne({ access_token: bearerToken })
            .then(token => {
              if (!token) {
                return callback(null, null);
              }

              return userCollection.findOne({
                  _id: token.user_id
                }, {
                  _id: 1,
                  name: 1,
                  email: 1,
                  mobile: 1,
                  avatar: 1,
                  // 'wechat.openid': 1
                })
                .then(user => {
                  console.log(user)
                  token.user = user;

                  return setUserAccessTokenRelation(user, token)
                    .then(() => {
                      callback(null, token);
                      console.log(1212)
                    }).catch(e=>{console.log(e);throw new Error(e)});
                });
            });
        }
      }).catch(callback);
    },
  };
};
