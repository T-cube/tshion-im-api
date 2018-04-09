const redis = require('@ym/redis').promiseRedis({
  host: '127.0.0.1',
  port: 6379,
  db: 3,
  auth: null,
  retry_max_value: 5,
  prefix: 'tlf_'
});


const PREFIX = {
  USER_INFO: 'user.info_',
  ACCESS_TOKEN: 'oauth.access_',
  USER_ACCESS: 'user.access_'
};

var exports = module.exports;

/**
 * set userinfo to redis cache
 * @param {{}} userinfo
 * @returns {Promise}
 */
function setUserInfoCache(userinfo) {
  let user_key = `${PREFIX.USER_INFO}${userinfo._id.toHexString()}`;

  return redis.hmset(user_key, userinfo);
};

/**
 * update userinfo in redis cache
 * @param {{}} info
 * @returns {Promise}
 */
function updateUserInfoCache(info) {
  let user_key = `${PREFIX.USER_INFO}${info._id.toHexString()}`;

  return redis.hmset(user_key, info);
};

/**
 * get user info from redis cache
 * @param {String|{}} user_id
 * @returns {Promise}
 */
function getUserInfoCache(user_id) {
  let user_key = `${PREFIX.USER_INFO}${(typeof user_id =='string')? user_id:user_id.toHexString()}`;

  return redis.hmget(user_key);
};

/**
 * set access token to redis cache
 * @param {{}} token
 */
function setAccessTokenCache(token) {
  let key = `${PREFIX.ACCESS_TOKEN}${token.access_token}`;

  return redis.hmset(key, token);
};

/**
 * get access token info from redis cache
 * @param {String} access_token
 * @returns {Promise}
 */
function getAccessTokenCache(access_token) {
  let key = `${PREFIX.ACCESS_TOKEN}${access_token}`;

  return redis.hmget(key);
};

/**
 * set user and access token relation ship
 * @param {{}} user
 * @param {{}} token
 * @returns {Promise}
 */
function setUserAccessTokenRelation(user, token) {
  let user_token = `${PREFIX.USER_ACCESS}${user._id.toHexString()}`;
  let key = `${PREFIX.ACCESS_TOKEN}${token.access_token}`;

  return redis.get(user_token).then(preKey => {
    return Promise.all([
      redis.del(preKey ? preKey : ''),
      redis.set(user_token, key),
      setAccessTokenCache(token),
      setUserInfoCache(user)
    ]);
  });
};

exports.setUserInfoCache = setUserInfoCache;
exports.updateUserInfoCache = updateUserInfoCache;
exports.getUserInfoCache = getUserInfoCache;
exports.setAccessTokenCache = setAccessTokenCache;
exports.getAccessTokenCache = getAccessTokenCache;
exports.setUserAccessTokenRelation = setUserAccessTokenRelation;
