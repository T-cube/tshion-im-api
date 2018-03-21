'use strict';

/**
 *
 * @param {*} app
 * @return {Badger}
 */
module.exports = function(app) {
  const BadgeCollection = app.db.collection('notification.badge');

  /**
   * badge manager
   *
   * @class Badger
   */
  class Badger {
    /**
     * get badge num
     * @param {*} query
     * @returns {Promise}
     */
    static getBadge(query) {
      return BadgeCollection.findOne(query);
    }

    static _updateBadge(query, data, options) {
      console.log(arguments);
      return BadgeCollection.findOneAndUpdate(query, data, Object.assign({
        returnOriginal: false,
        returnNewDocument: true
      }, options)).then(res => res.value);
    }

    /**
     * set badge num
     * @param {*} query
     * @param {*} badge
     * @returns {Promise}
     */
    static setBadge(query, badge) {
      console.log(arguments);
      return Badger._updateBadge(query, {
        $set: {...query, badge }
      }).then(() => badge);
    }

    /**
     * increase badge num
     * @param {*} query
     * @param {*} num
     * @returns {Promise}
     */
    static incBadge(query, num) {
      return Badger._updateBadge(query, { $inc: { badge: num || 1 } }, { upsert: true });
    }

    /**
     * decline badge num
     * @param {*} query
     * @returns {Promise}
     */
    static deincBadge(query, num) {
      return Badger._updateBadge(query, { $inc: { badge: -(num || 1) } }, { upsert: true });
    }
  };

  return Badger;
};
