'use strict';

module.exports = function(app) {
  const Group = require('../../../models/group')(app);
  const Setting = require('../../../models/group/setting')(app);
  const Member = require('../../../models/group/member')(app);
  const User = require('../../../models/user')(app);
  const Message = require('../../../models/message')(app);
  const File = require('../../../models/file')(app);

  const ObjectID = app.get('ObjectID');
  const drawer = require('../../../vendor/drawer')();
  const config = require('../../../../config/config');

  return {
    get: {
      'session/all': {
        docs: {
          name: '获取会话列表',
          params: []
        },
        method(req, res, next) {
          var user = req.user;
          Group
            .getListByUid(user._id)
            .then(groups => {
              let roomids = groups.map(group => group.roomid);
              return Message
                .getLastMessageByRommids(roomids)
                .then(messages => {
                  return Message.offlineMessageCountByRoomids(user._id.toHexString(), roomids).then(counts => {
                    var results = [];
                    messages.forEach((message, index) => {
                      if (message) {

                        var group = groups[index];
                        group.message = message;

                        var count = counts.find(c => c.roomid == group.roomid);
                        if (count) {
                          group._offline_count = count.count;
                        } else {
                          group._offline_count = 0;
                        }
                        results.push(group);
                      }

                      if (results.length) {
                        results.sort((a, b) => b.message.timestamp - a.message.timestamp);
                      }
                    });

                    res.sendJson(results);
                  });
                });
            })
            .catch(next);
        }
      },
      '': {
        docs: {
          name: '获取群组列表',
          params: [
            {
              query: 'user_id',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          let user = req.user;
          Group
            .getListByUid(user._id)
            .then(groups => {
              res.sendJson(groups);
            })
            .catch(next);
        }
      },
      ':group_id': {
        docs: {
          name: '获取群组信息',
          params: [
            {
              param: 'group_id',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          console.log(req.params.group_id);
          Group
            .info(req.params.group_id)
            .then(info => {
              res.sendJson(info);
            })
            .catch(next);
        }
      },
      'members/:group_id': {
        docs: {
          name: '获取群组内成员列表',
          params: [
            {
              param: 'group_id',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          Member
            .getMembersByGroupId(req.params.group_id)
            .then(members => {
              res.sendJson(members);
            })
            .catch(next);
        }
      },
      'member/:member_id': {
        docs: {
          name: '获取成员信息',
          params: [
            {
              param: 'member_id',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          let user = req.user;
          let { member_id } = req.params;
          Member
            .getMemberInfo(member_id)
            .then(info => {
              return User
                .user(info.uid, user._id)
                .then(friend => {
                  res.sendJson(Object.assign(info, friend));
                });
            })
            .catch(next);
        }
      }
    },
    post: {
      '': {
        docs: {
          name: '创建群组',
          params: [
            {
              key: 'members',
              type: 'Array'
            }, {
              key: 'creator',
              type: 'String'
            }, {
              key: 'name',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          let body = req.body;
          let user = req.user;

          let { members } = body;
          body.creator = user._id;

          if (!members)
            members = [];
          if (members.indexOf(','))
            members = members.split(',');

          // if (!~members.indexOf(user._id.toHexString())) members.push(user._id);

          console.log('body:', req.body);
          new Group(body)
            .save(members)
            .then(newGroup => {
              var group = newGroup._id;

              return Promise.all([
                new Setting({ group }).save(),
                Member.addMany(members, group)
              ]).then(() => {
                var uids = members.map(member => ObjectID(member));
                return User.findMany({ _id: { $in: uids } }).then(users => {
                  var imgs = users.map(user => (user.avatar || 'http://cdn-public-test.tlifang.com/upload/admin/avatar/jxk9mhivn706mxYmVl.png') + '?imageView2/0/w/80/h/80/q/96');

                  return drawer.puzzle.apply(drawer, imgs).then(result => {
                    return File.streamSaveCdn({ stream: result.stream }).then(data => {
                      var cache = {
                        filename: `${data.uuid}.png`,
                        hash: data.result.hash,
                        mimeType: 'image/png',
                        extensions: 'png',
                        cdn: data.result,
                        url: `${data.result.server_url}/${data.result.key}`
                      }

                      return new File(cache).saveCache().then(cacheFile => {
                        cache.copy = cacheFile._id;
                        return new File(cache).save().then(file => {
                          var url = config.apiUrl + 'file/image/view/' + file._id.toHexString();
                          return Group.modifyGroupAvatar(group, url).then(result => {
                            res.sendJson(result)


                            members.forEach(member => {
                              req
                                .pomelo
                                .rpc
                                .push
                                .pushRemote
                                .notifyClient(null, 'group.join', {
                                  group: newGroup._id,
                                  type: 'add'
                                }, member, function(err) {
                                  if (err) {
                                    console.error('notify error:', err);
                                  }
                                });
                            });
                          });
                        });
                      })
                    })
                  })
                });
              });
            })
            .catch(([errSetting, memberError]) => {
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
            {
              param: 'group_id',
              type: 'String'
            }, {
              key: 'name',
              type: 'String'
            }
          ]
        },
        method(req, res, next) {
          var user = req.user;
          var group_id = req.params.group_id;

          Group
            .findGroupByIdAndOwner(group_id, user._id)
            .then(group => {
              if (!group) {
                return ext(req.apiError(400, 'cant only midify by owner'));
              }

              Group
                .modifyGroupName(group_id, req.body.name)
                .then(result => {
                  res.sendJson(result);
                });
            })
            .catch(next);
        }
      },
      'member/add/:group_id': {
        docs: {
          name: '群组添加成员',
          params: [
            {
              param: 'group_id',
              type: 'String'
            }, {
              key: 'members',
              type: 'Array'
            }
          ]
        },
        method(req, res, next) {
          let { members } = req.body;
          console.log(req.body);

          if (members.indexOf(','))
            members = members.split(',');

          let { group_id } = req.params;
          let user = req.user;

          Group
            .findGroupByIdAndOwner(group_id, user._id)
            .then(group => {
              if (!group)
                return next(req.apiError(400, 'cant add member by not a owner'));

              if (members instanceof String)
                members = [members];

              Member
                .addMany(members, group_id)
                .then(result => {
                  res.sendJson(result);

                  Member
                    .getMembers(group_id)
                    .then(results => {
                      console.log(results);
                      results.map(member => {
                        req
                          .pomelo
                          .rpc
                          .push
                          .pushRemote
                          .notifyClient(null, 'group.join', {
                            group: group_id,
                            type: 'add'
                          }, member.uid.toHexString(), function(err) {
                            if (err) {
                              console.error('notify error:', err);
                            }
                          });
                      });
                    });

                })
                .catch(next);
            });
        }
      }
    },
    delete: {
      'member/:group_id': {
        docs: {
          name: '删除群组成员',
          params: [
            {
              param: 'group_id',
              type: 'String'
            }, {
              key: 'members',
              type: 'Array'
            }
          ]
        },
        method(req, res, next) {
          let { members } = req.body;
          let { group_id } = req.params;
          let user = req.user;

          Group
            .findGroupByIdAndOwner(group_id, user._id)
            .then(group => {
              if (!group)
                return next(req.apiError(400, 'cant remove member by not a owner'));

              if (members instanceof String)
                members = [members];

              Member
                .deleteMembers(members)
                .then(result => {
                  res.sendJson(result);
                })
                .catch(next);
            });
        }
      },
      'quit/:group_id': {
        docs: {
          name: '退出群组'
        },
        method(req, res, next) {}
      }
    }
  };
};
