'use strict';

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const Feedback = require('../../../models/feedback')(app);
  const User = require('../../../models/user')(app);

  return {
    get: {
      'feedback': {
        docs: {
          name: '待定',
          params: [
            { param: 'group_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          res.sendJson(Feedback.insertView('abc'));
        }
      }
    },
    post: {
      'view/add': {
        docs: {
          name: '添加用户意见',
          params: [
            { key: 'message', type: 'String' }
          ]
        },
        method(req, res, next) {
          let body = req.body;
          let user = req.user;

          let { message } = body;
          body.viewer = user._id;

          if (!message){
            return next(req.apiError(400, 'lack message'));
          }
          console.log('body:', req.body);

          new Feedback(body)
            .insertView()
            .then(result=>{
              res.sendJson(result);
            })
            .catch(next);

          // Feedback
          //   .insertView(body)
          //   .then(result=>{
          //     res.sendJson(result);
          //   })
          //   .catch(next);
        }
      }
    },
    put: {
      'report/:be_reported': {
        docs: {
          name: '添加举报消息',
          params: [
            {
              param: 'be_reported',
              type: 'String'
            }, {
              key: 'message',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          let user=req.user;
          let be_reported=req.params.be_reported;
          let message=req.body.message;
          let findUser={_id:ObjectID(be_reported)};

          if(!message){
            return next(req.apiError(400,'lack message'));
          }
          if(!be_reported){
            return next(req.apiError(400,'lack be_reported'));
          }

          User
            .findUser(findUser)
            .then(user=>{
              if (!user){
                return next(req.apiError(400,'the user which was reported is non-existent'));
              }

              Feedback
                .insertReport(user._id,be_reported,message)
                .then(result=>{
                  res.sendJson(result);
                })
                .catch(next);
            });
        }
      }
    },
    delete: {
      'feedback': {
        docs: {
          name: '待定',
          params: [
            { param: 'group_id', type: 'String' }
          ]
        },
        method(req, res, next) {
        }
      }
    }
  };
};