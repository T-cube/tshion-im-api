'use strict';

module.exports = function(app) {
  const Group = require('../../../models/group')(app);
  const Setting = require('../../../models/group/setting')(app);
  const Member = require('../../../models/group/member')(app);

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
          Group.getListByUid(req.query.user_id).then(groups => {
            res.json(groups);
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
          Group.info(req.params.group_id).then(info => {
            res.json(info);
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
            res.json(members);
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
          let { member_id } = req.params;

          Member.getMemberInfo(member_id).then(info => {
            res.json(info);
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
          let { members } = req.body;

          new Group(req.body).save().then(newGroup => {
            var group = newGroup._id;

            return Promise.all([
              new Setting({ group }).save(),
              Member.addMany(members, group)
            ]).then(() => {
              res.json(newGroup);
            });
          }).catch(next);
        }
      }
    },
    put: {
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
          let { group_id } = req.params;

          if (members instanceof String) members = [members];

          Member.addMany(members, group).then(result => {
            res.json(result);
          }).catch(next);
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

          if (members instanceof String) members = [members];

          Member.deleteMembers(members).then(result => {
            res.json(result);
          }).catch(next);
        }
      }
    }
  };
};
