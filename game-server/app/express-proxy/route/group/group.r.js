'use strict';

module.exports = function(app) {
  const Group = require('../../../models/group')(app);
  const Setting = require('../../../models/group/setting')(app);
  const Member = require('../../../models/group/member')(app);
  const User = require('../../../models/user')(app);

  return {
    get: {
      '': {
        docs: {
          name: '获取群组列表',
          params: [
            { query: 'user_id', type: 'String' },
          ]
        },
        method(req, res, next) {
          let user = req.user;
          Group.getListByUid(user._id).then(groups => {
            res.sendJson(groups);
          }).catch(next);
        }
      },
      ':group_id': {
        docs: {
          name: '获取群组信息',
          params: [
            { param: 'group_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          console.log(req.params.group_id);
          Group.info(req.params.group_id).then(info => {
            res.sendJson(info);
          }).catch(next);
        }
      },
      'members/:group_id': {
        docs: {
          name: '获取群组内成员列表',
          params: [
            { param: 'group_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          Member.getMembersByGroupId(req.params.group_id).then(members => {
            res.sendJson(members);
          }).catch(next);
        }
      },
      'member/:member_id': {
        docs: {
          name: '获取成员信息',
          params: [
            { param: 'member_id', type: 'String' }
          ]
        },
        method(req, res, next) {
          let user = req.user;
          let { member_id } = req.params;
          Member.getMemberInfo(member_id).then(info => {
            return User.user(info.uid, user._id).then(friend => {
              res.sendJson(Object.assign(info, friend));
            });
          }).catch(next);
        }
      }
    },
    post: {
      '': {
        docs: {
          name: '创建群组',
          params: [
            { key: 'members', type: 'Array' },
            { key: 'creator', type: 'String' },
            { key: 'name', type: 'String' }
          ]
        },
        method(req, res, next) {
          let body = req.body;
          let user = req.user;

          let { members } = body;
          body.creator = user._id;

          if(!members) members = [];
          if(members.indexOf(',')) members = members.split(',');
          // if (!~members.indexOf(user._id.toHexString())) members.push(user._id);


          console.log('body:', req.body);
          new Group(body).save(members).then(newGroup => {
            var group = newGroup._id;

            return Promise.all([
              new Setting({ group }).save(),
              Member.addMany(members, group)
            ]).then(() => {
              res.sendJson(newGroup);

              members.map(member => {
                req.pomelo.rpc.push.pushRemote.notifyClient(null, 'group.join', {
                  group: newGroup._id,
                  type: 'add'
                }, member, function(err) {
                  if (err) {
                    console.error('notify error:', err);
                  }
                });
              });
            });
          }).catch(([errSetting, memberError]) => {
            console.log(memberError, errSetting);
            next(req.apiError(400, errSetting || memberError));
          });
        }
      }
    },
    put: {
      'modify/:group_id/name': {
        docs: {
          name: '修改群名称',
          params: [
            {param: 'group_id', type:'String'},
            {key: 'name', type: 'String'}
          ]
        },
        method(req,res,next) {
          var user = req.user;
          var group_id = req.params.group_id;

          Group.findGroupByIdAndOwner(group_id, user._id).then(group=>{
            if(!group){
              return ext(req.apiError(400, 'cant only midify by owner'));
            }

            Group.modifyGroupName(group_id, req.body.name).then(result=>{
              res.sendJson(result);
            });
          }).catch(next);
        }
      },
      'member/add/:group_id': {
        docs: {
          name: '群组添加成员',
          params: [
            { param: 'group_id', type: 'String' },
            { key: 'members', type: 'Array' },
          ]
        },
        method(req, res, next) {
          let { members } = req.body;
          console.log(req.body);

          if(members.indexOf(',')) members = members.split(',');


          let { group_id } = req.params;
          let user = req.user;

          Group.findGroupByIdAndOwner(group_id, user._id).then(group => {
            if (!group) return next(req.apiError(400, 'cant add member by not a owner'));

            if (members instanceof String) members = [members];

            Member.addMany(members, group_id).then(result => {
              res.sendJson(result);

              members.map(member => {
                req.pomelo.rpc.push.pushRemote.notifyClient(null, 'group.join', {
                  group: group_id,
                  type: 'add'
                }, member, function(err) {
                  if (err) {
                    console.error('notify error:', err);
                  }
                });
              });

            }).catch(next);
          });
        }
      }
    },
    delete: {
      'member/:group_id': {
        docs: {
          name: '删除群组成员',
          params: [
            { param: 'group_id', type: 'String' },
            { key: 'members', type: 'Array' }
          ]
        },
        method(req, res, next) {
          let { members } = req.body;
          let { group_id } = req.params;
          let user = req.user;

          Group.findGroupByIdAndOwner(group_id, user._id).then(group => {
            if (!group) return next(req.apiError(400, 'cant remove member by not a owner'));

            if (members instanceof String) members = [members];

            Member.deleteMembers(members).then(result => {
              res.sendJson(result);
            }).catch(next);
          });
        }
      },
      'quit/:group_id': {
        docs: {
          name: '退出群组'
        },
        method(req, res, next) {

        }
      }
    }
  };
};
