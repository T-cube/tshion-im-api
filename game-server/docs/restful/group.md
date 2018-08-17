# group api

## create group
POST /api/group

param|name|type|des
-----|----|----|---
key|creator|String|*discard*, group creator _id
key|name|String|group name
key|members|Array|member user_id array, max 20 once, max 200 total

returns
```json
{
    "status": 200,
    "data": {
        "name": "穷逼联盟",
        "creator": "5af2f2521a8c960351f3cce4",
        "owner": "5af2f2521a8c960351f3cce4",
        "roomid": "9baacfb7617b1f20cad748ade412c885f1b59375",
        "create_at": "2018-07-03T02:56:00.333Z",
        "update_at": "2018-07-03T02:56:00.333Z",
        "_id": "5b3ae5c0574203eccd026ee9"
    },
    "message": ""
}
```

## get user group list
GET /api/group

param|name|type|des
-----|----|----|---
query|user_id|String|user _id

returns:
```json
{
    "status": 200,
    "data": [
        {
            "_id": "5b3aeaf1d15fbbf2730257e4",
            "name": "复仇者联盟",
            "creator": "5af2f2521a8c960351f3cce4",
            "owner": "5af2f2521a8c960351f3cce4",
            "roomid": "94bf34abb8a18f074d3c6fb53dd5d9ce22f2a540",
            "create_at": "2018-07-03T03:18:09.460Z",
            "update_at": "2018-07-03T03:18:09.460Z"
        }
    ],
    "message": ""
```

## get group info detail
GET /api/group/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string

returns
```json
{
    "status": 200,
    "data": {
        "_id": "5b3aeaf1d15fbbf2730257e4",
        "name": "复仇者联盟",
        "creator": "5af2f2521a8c960351f3cce4",
        "owner": "5af2f2521a8c960351f3cce4",
        "roomid": "94bf34abb8a18f074d3c6fb53dd5d9ce22f2a540",
        "create_at": "2018-07-03T03:18:09.460Z",
        "update_at": "2018-07-03T03:18:09.460Z",
        "setting": {
            "_id": "5b3aeaf1be1f43069252d9e0",
            "group": "5b3aeaf1d15fbbf2730257e4",
            "level": "",
            "status": "normal",
            "type": "normal",
            "create_at": "2018-07-03T03:18:09.466Z"
        },
        "member_count": 4
    },
    "message": ""
}
```

## get group member list
GET /api/group/members/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string

returns
```json
{
    "status": 200,
    "data": [
        {
            "_id": "5b3aeaf1be1f43069252d9df",
            "uid": "5af2f2521a8c960351f3cce4",
            "type": "owner",
            "status": "normal",
            "name": "cym",
            "avatar": ""
        },
        {
            "_id": "5b3aeaf1d15fbbf2730257e6",
            "name": "black JJ",
            "avatar": "http://cdn-public-test.tlifang.com/upload/avatar/aab75818-291f-4141-9c18-4c2ed6f7e564.jpg",
            "type": "normal",
            "status": "normal",
            "uid": "5af2f1171a8c960351f3ccdf"
        },
        {
            "_id": "5b3aeaf1d15fbbf2730257e7",
            "name": "Lizhen dd",
            "avatar": "",
            "type": "normal",
            "status": "normal",
            "uid": "5af309d41a8c960351f3cd3e"
        },
        {
            "_id": "5b3aeaf1d15fbbf2730257e8",
            "name": "Huhi",
            "avatar": "",
            "type": "normal",
            "status": "normal",
            "uid": "5af3baa83fad6632e112ac19"
        }
    ],
    "message": ""
}
```

## get group one member info detail
GET /api/group/member/:member_id

param|name|type|des
-----|----|----|---
param|member_id|type|String|member in group _id

returns
```json
{
    "status": 200,
    "data": {
        "_id": "5af2f1171a8c960351f3ccdf",
        "name": "black JJ",
        "avatar": "http://cdn-public-test.tlifang.com/upload/avatar/aab75818-291f-4141-9c18-4c2ed6f7e564.jpg",
        "type": "normal",
        "status": "normal",
        "create_at": "2018-07-03T03:18:09.469Z",
        "uid": "5af2f1171a8c960351f3ccdf",
        "group": "5b3aeaf1d15fbbf2730257e4",
        "email": "",
        "mobile": "98935994",
        "sex": "M",
        "nickname": "123",
        "setting": {
            "not_distub": 0
        }
    },
    "message": ""
}
```

## add group member
PUT /api/group/member/add/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string
key|members|Array|user _id array

returns
```json
{
    "status": 200,
    "data": [
        "5b3af39b976c2efc9445ef9c"  // member ids
    ],
    "message": ""
}
```

## delete group member
DELETE /api/group/member/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string
key|members|Array|user _id array

returns
```json
{
    "status": 200,
    "data": 1,  // delete count
    "message": ""
}
```

## modify group name
PUT /api/group/modify/:group_id/name

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string
key|name|String|new Group name

returns
```json
{
    "status": 200,
    "data": {
        "_id" : "5b3df077f52ebda500b30966",
        "name" : "black JJ的群",
        "creator" : "5af2f1171a8c960351f3ccdf",
        "owner" : "5af2f1171a8c960351f3ccdf",
        "roomid" : "19a2b9f582103a6b520923553935c3cecf413166",
        "create_at" : "2018-07-05T10:18:31.542Z",
        "update_at" : "2018-07-05T10:18:31.542Z",
    },
    "message": ""
}
```

## get session list
GET /api/group/session/all

returns
```json
{
    "status": 200,
    "data": [
        {
            "_id": "5b3b4582626cbc81f8bebe4e",
            "name": "群名称",
            "creator": "5af2f2521a8c960351f3cce4",
            "owner": "5af2f2521a8c960351f3cce4",
            "roomid": "5b367128ed63c5d1e722df5c65205baeae455bee",
            "create_at": "2018-07-03T09:44:34.955Z",
            "update_at": "2018-07-03T09:44:34.955Z",
            "message": {
                "_id": "5b3f0bdfa62b34da41161c21",
                "content": "哦哦哦哦哦",
                "from": "5af2f1171a8c960351f3ccdf",
                "roomid": "5b367128ed63c5d1e722df5c65205baeae455bee",
                "route": "onChat.group",
                "group": "5b3b4582626cbc81f8bebe4e",
                "timestamp": 1530858463872,
                "type": "text",
                "__route__": "chat.chatHandler.sendGroup"
            },
            "_offline_count": 0
        },
    ],
    "messsage": ""
}
```

## 群消息免打扰
PUT /api/group/distub/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string

## 退群
DELETE /api/group/quit/:group_id

param|name|type|des
-----|----|----|---
param|group_id|String|group _id string

## 删除一个群成员
DELETE /api/group/member

param|name|type|des
-----|----|----|---
key|group_id|String|group _id string
key|member|String|user _id string who should be delete
