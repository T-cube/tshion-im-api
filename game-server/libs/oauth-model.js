'use strict';

module.exports = function(app) {
  const tlf_db = app.tlf_db;

  const userCollection = tlf_db.collection('user');
  const accesstokenCollection = tlf_db.collection('oauth.accesstoken');

  return {
    getAccessToken(bearerToken, callback) {
      console.log('# getAccessToken (bearerToken: ' + bearerToken + ')');
      accesstokenCollection.findOne({ access_token: bearerToken })
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
          }).then(user => {
            token.user = user;
            console.log(user);
            callback(null, token);
          });
        }).catch(e => callback(e));
    }
  };
};
