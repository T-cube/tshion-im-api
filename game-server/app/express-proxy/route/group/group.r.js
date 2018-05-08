'use strict';

module.exports = function (app) {
  const Group = require('../../../models/group')(app);
  const Setting = require('../../../models/group/setting')(app);
  const Member = require('../../../models/group/member')(app);
  const {MemberType} = require('../../../shared/constant');
  const Notice = require('../../../models/group/notice');
  const mNotice = new Notice(app);

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
      },
      'notice/:group_id': {
        docs: {
          name: '获取群公告',
          params: [
            {param: 'group_id', type: 'String'},
            {param: 'last', type: 'Number'}
          ]
        },
        method(req, res, next) {
          let {group_id, last} = req.params;

          mNotice.findList(group_id, last).then(list => {
            res.sendJson(list);
          }).catch(next);
        }
      },
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
      },
      "notice/:group_id": {
        docs: {
          name: '创建群公告',
          params: [
            {param: 'group_id', type: 'String'},
            {key: 'title', type: 'String'},
            {key: 'content', type: 'String'}
          ]
        },
        method(req, res, next) {
          let {title, content} = req.body;
          let {group_id} = req.params;
          let uid = req.user.id;

          Group.info(group_id).then(info => {
            if (info.owner !== uid) {
              next(req.apiError(402, '只有群主才能创建群公告'));
            }
            else {
              mNotice.insert({
                groupId: group_id,
                title: title,
                content: content,
                sender: uid
              }).then(result => {
                res.sendJson(result);
              }).catch(next);
            }
          }).catch(next);

        }
      }
    },
    put: {
      'member/add/:group_id':
        {
          docs: {
            name: '群组添加成员',
            params:
              [
                {param: 'group_id', type: 'String'},
                {key: 'members', type: 'Array'},
              ]
          }
          ,
          method(req, res, next) {
            let {members} = req.body;
            let {group_id} = req.params;

            if (typeof members === 'string') {
              members = JSON.parse(members);
            }

            Member.addMany(members, group_id).then(result => {
              res.sendJson(result);
            }).catch(next);
          }
        }
      ,
      'transfer/:group_id':
        {
          docs: {
            name: '群主转让',
            params:
              [
                {param: 'group_id', type: 'String'},
                {key: 'member', type: 'String'},
              ]
          }
          ,
          method(req, res, next) {
            let {member} = req.body;
            let {group_id} = req.params;
            Group.info(req.params.group_id).then(info => {
              if (info.owner === req.user.id) {
                Member.setMemberType(group_id, member, MemberType.owner).then(result => {
                  if (result.matchedCount === 0) {
                    next(req.apiError(402, 'member_id不是群成员'));
                  }
                  else {
                    Member.setMemberType(group_id, req.user.id, MemberType.normal).then(result => {
                      Group.updateGroup(group_id, {$set: {owner: member}}).then(result => {
                        res.sendJson(result);
                      });
                    });
                  }
                }).catch(next);
              }
              else {
                next(req.apiError(402, '只有群主才能转让'));
              }
            });

          }
        },
      "notice/:notice_id": {
        docs: {
          name: '修改群公告',
          params: [
            {param: 'notice_id', type: 'String'},
            {key: 'title', type: 'String'},
            {key: 'content', type: 'String'}
          ]
        },
        method(req, res, next) {
          let {title, content} = req.body;
          let {notice_id} = req.params;
          let uid = req.user.id;

          mNotice.findOne(notice_id).then(result => {
            Group.info(result.groupId).then(info => {
              if (info.owner !== uid) {
                next(req.apiError(402, '只有群主才能修改群公告'));
              }
              else {
                let setObj = {};
                if (title) {
                  setObj.title = title;
                }
                if (content) {
                  setObj.content = content;
                }
                mNotice.update(notice_id, setObj).then(result => {
                  res.sendJson(result);
                }).catch(next);
              }
            }).catch(next);
          });

        }
      }
    }
    ,
    delete:
      {
        'member/:group_id':
          {
            docs: {
              name: '删除群组成员',
              params:
                [
                  {param: 'group_id', type: 'String'},
                  {key: 'members', type: 'Array'}
                ]
            }
            ,
            method(req, res, next) {
              let {members} = req.body;
              let {group_id} = req.params;

              if (typeof members === 'string') {
                members = JSON.parse(members);
              }

              Group.info(req.params.group_id).then(info => {
                if (info.owner === req.user.id) {
                  if (members.some(item => item === req.user.id)) {
                    next(req.apiError(402, '不能删除群主'));
                  }
                  else {
                    Member.deleteMembers(members, group_id).then(result => {
                      res.sendJson(result);
                    }).catch(next);
                  }
                }
                else {
                  next(req.apiError(402, '只有群主才能删除群组成员'));
                }
              });

            }
          }
        ,
        'quit/:group_id':
          {
            docs: {
              name: '退出群组',
              params:
                [
                  {param: 'group_id', type: 'String'},
                ]
            }
            ,
            method(req, res, next) {
              let {group_id} = req.params;
              Group.info(group_id).then(info => {
                if (info.owner === req.user.id) {
                  next(req.apiError(402, '群主无法退出群'));
                }
                else {
                  Member.deleteMembers([req.user.id], group_id).then(result => {
                    res.sendJson(result);
                  }).catch(next);
                }
              });
            }
          }
        ,
        ':group_id':
          {
            docs: {
              name: '删除解散群'
            }
            ,
            method(req, res, next) {
              let {group_id} = req.params;
              Group.info(group_id).then(info => {
                if (info.owner === req.user.id) {
                  Group.deleteGroup(group_id).then(result => {
                    Member.deleteGroup(group_id).then(result => {
                      res.sendJson(result);
                    }).catch(next);
                  });
                }
                else {
                  next(req.apiError(402, '群主才能解散群'));
                }
              }).catch(next);
            }
          },
        "notice/:notice_id": {
          docs: {
            name: '删除群公告',
            params: [
              {param: 'notice_id', type: 'String'},
            ]
          },
          method(req, res, next) {
            let {group_id, notice_id} = req.params;
            let uid = req.user.id;
            mNotice.findOne(notice_id).then(result => {
              Group.info(result.groupId).then(info => {
                if (info.owner !== uid) {
                  next(req.apiError(402, '只有群主才能删除群公告'));
                }
                else {
                  mNotice.update(notice_id, setObj).then(result => {
                    res.sendJson(result);
                  }).catch(next);
                }
              }).catch(next);
            }).catch(next);

          }
        }
      }

  };
};
