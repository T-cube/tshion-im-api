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
          Promise.all([app.Redis.get(bearerToken), app.Redis.pttl(bearerToken)]).then(res => {
            let [uid, leftTimes] = res;
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
                let token = {
                  user_id: uid,
                  user: user,
                  expires: new Date(Date.now() + leftTimes),
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
