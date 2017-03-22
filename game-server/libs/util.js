module.exports = {
  /**
   * get data type
   * @param {*} data
   * @return {String}
   */
  getType: function(data) {
    return Object.prototype.toString.call(data).replace(/^\[\w+\s|\]$/g, '').toLowerCase();
  }
};
