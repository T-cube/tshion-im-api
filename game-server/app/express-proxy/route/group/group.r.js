'use strict';

module.exports = function (app) {
  const Group = require('../../../models/group')(app);
  const Setting = require('../../../models/group/setting')(app);
  const Member = require('../../../models/group/member')(app);

  return {
    get: {
      '': {
        docs: {
          name: '获取群组列表',
          params: []
        },
        method(req, res, next) {
          Group.getListByUid(req.user.id).then(groups => {
            res.sendJson(groups);
          }).catch(next);
        }
      },
      ':group_id': {
        docs: {
          name: '获取群组信息',
          params: [
            {param: 'group_id', type: 'String'}
          ]
        },
        method(req, res, next) {
          Group.info(req.params.group_id).then(info => {
            res.sendJson(info);
          }).catch(next);
        }
      },
      'members/:group_id': {
        docs: {
          name: '获取群组内成员列表',
          params: [
            {param: 'group_id', type: 'String'}
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
            {param: 'member_id', type: 'String'}
          ]
        },
        method(req, res, next) {
          let {member_id} = req.params;

          Member.getMemberInfo(member_id).then(info => {
            res.sendJson(info);
          }).catch(next);
        }
      }
    },
    post: {
      '': {
        docs: {
          name: '创建群组',
          params: [
            {key: 'members', type: 'Array'},
            {key: 'name', type: 'String'}
          ]
        },
        method(req, res, next) {
          let {members} = req.body;
          console.log('body:', req.body);
          if (typeof members === 'string') {
            members = JSON.parse(members);
          }
          req.body.creator = req.user.id;
          new Group(req.body).save().then(newGroup => {
            let group = newGroup._id;

            return Promise.all([
              new Setting({group}).save(),
              Member.addMany(members, group)
            ]).then(() => {
              res.sendJson(newGroup);
            }).catch(err => {
              console.error(err);
            });
          }).catch(([errSetting, memberError]) => {
            console.log(memberError, errSetting);
            next(req.apiError(400, errSetting || memberError));
          });
        }
      }
    },
    put: {
      'member/add/:group_id': {
        docs: {
          name: '群组添加成员',
          params: [
            {param: 'group_id', type: 'String'},
            {key: 'members', type: 'Array'},
          ]
        },
        method(req, res, next) {
          let {members} = req.body;
          let {group_id} = req.params;

          if (members instanceof String) members = [members];

          Member.addMany(members, group).then(result => {
            res.sendJson(result);
          }).catch(next);
        }
      }
    },
    delete: {
      'member/:group_id': {
        docs: {
          name: '删除群组成员',
          params: [
            {param: 'group_id', type: 'String'},
            {key: 'members', type: 'Array'}
          ]
        },
        method(req, res, next) {
          let {members} = req.body;
          let {group_id} = req.params;

          if (members instanceof String) members = [members];

          Member.deleteMembers(members).then(result => {
            res.sendJson(result);
          }).catch(next);
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
