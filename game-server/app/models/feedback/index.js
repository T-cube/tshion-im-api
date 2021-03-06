'use strict';

const _ = require('../../../libs/util'),
  schema = require('./schema');

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const viewCollection = app.db.collection('feedback.view');
  const reportCollection = app.db.collection('feedback.report');

  return class Feedback {
    constructor(info) {console.log('info:',info);
      let { viewer, message } = info;
      let target={viewer:ObjectID(viewer),message:message};
      _.extend(target,this,schema);
    }

    /**
     * 存入用户相关意见
     * @param {String} message
     * @returns {Promise}
     */
    insertView() {console.log('this:',this);
      return viewCollection.insertOne({viewer:ObjectID(this.viewer),message:this.message,date_join:new Date});
    }

    /**
     * 存入用户相关意见
     * @param {String} message
     * @returns {Promise}
     */
    // static insertView(body) {
    //   return viewCollection.insertOne({viewer:ObjectID(body.viewer),message:body.message,date_join:new Date});
    // }

    /**
     * 存入举报相关
     * @param {String} user_id
     * @param {String} be_reported
     * @param {String} message
     * @returns {Promise}
     */
    static insertReport(user_id,be_reported,message) {
      return reportCollection.insertOne({reporter:ObjectID(user_id),be_reported:ObjectID(be_reported),date_join:new Date,message:message});
    }
  };
};
