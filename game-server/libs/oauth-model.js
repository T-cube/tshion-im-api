'use strict';

var {getUserInfoCache, getAccessTokenCache, setUserAccessTokenRelation} = require('./cache');

module.exports = function (app) {
  const tlf2_db = app.tlf2_db;
  const ObjectID = app.get('ObjectID');

  // const accesstokenCollection = tlf_db.collection('oauth.accesstoken');//改为redis获取

  return {
    getAccessToken(bearerToken, callback) {
      // console.log(bearerToken)
      // console.log('# getAccessToken (bearerToken: ' + bearerToken + ')');
      getAccessTokenCache(bearerToken).then(info => {
        // console.log(info);
        if (info) {
          return getUserInfoCache(info.user_id).then(user => {
            // console.log(user);
            info.user = user;
            return callback(null, info);
          });
        } else {
          // find access is exists
          return app.Redis.get(bearerToken).then(uid => {
            if (!uid) {
              return callback(null, null);
            }

            return tlf2_db.find('tlf_user', {
              id: uid
            }, {
              id: 1,
              name: 1,
              email: 1,
              mobile: 1,
              avatar: 1,
              // 'wechat.openid': 1
            })
            .then(res => {
              let user = res[0];
              console.log(user);
              //expires 当前后台无法获取token过期时间，采取当前时间加一天
              let token = {
                user_id: uid,
                user: user,
                expires: new Date(Date.now() + 24 * 3600 * 1000),
                access_token: bearerToken
              };
              return setUserAccessTokenRelation(user, token)
              .then(() => {
                callback(null, token);
              });
            });
          });
        }
      }).catch(callback);
    },
  };
};
