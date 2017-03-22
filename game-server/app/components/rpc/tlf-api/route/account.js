module.exports = {
  /**
   * @param {Array} data,  user_id list
   */
  'onlineStatus': function(data, app) {
    return Promise.all(Array.prototype.map.call(data, uid => {
      return app.get('onlineRedis').get(uid);
    })).then(onlineList => {
      return onlineList.map((status, index) => {
        return { _id: data[index], status: status ? true : false };
      });
    });
  }
};
