'use strict';

const _ = require('../../../libs/util');

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const viewCollection = app.db.collection('feedback.view');
  const reportCollection = app.db.collection('feedback.report');

  return class Feedback {
    constructor(info) {console.log('info:',info);
      let { viewer, message } = info;
      console.log('viewer:',viewer);
      console.log('this:',this);
      let aaa={viewer:ObjectID(viewer),message:message};
      console.log('aaa:',aaa);
      console.log(typeof(this));
      console.log(typeof(aaa));
      _.extend(this,aaa);console.log('bbb:',this);
      // let bbb=_.extend(this,aaa);console.log('bbb:',bbb);
    }

    /**
     * 存入用户相关意见
     * @param {String} message
     * @returns {Promise}
     */
    // insertView() {console.log('this:',this);
    //   return this.message;
    // }

    /**
     * 存入用户相关意见
     * @param {String} message
     * @returns {Promise}
     */
    static insertView(body) {
      return viewCollection.insertOne({viewer:ObjectID(body.viewer),message:body.message,date_join:new Date});
    }

    static insertReport(user_id,be_reported,message) {
      return reportCollection.insertOne({reporter:ObjectID(user_id),be_reported:ObjectID(be_reported),date_join:new Date,message:message});
    }
  };
};
