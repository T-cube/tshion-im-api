# Chat api

## 拉去单聊会话列表
get /chat/session

param|name|type|des
-----|----|----|---

returns
```js
{
    "status": 200,
    "data": [
        {
            "_offline_count": 6,
            "member": {
                "_id": "5b28dc31c12fcb2623e24fc3",
                "name": "233",
                "avatar": "http://cdn-public-test.tlifang.com/upload/avatar/84e37fd9-f7a9-4bd6-8fe1-1a6c992263ac.jpg"
            },
            "message": {
                "_id": "5b399aeb1f6386049e8be26e",
                "content": "111",
                "from": "5b28dc31c12fcb2623e24fc3",
                "target": "5b28db89c12fcb2623e24fbe",
                "roomid": "f249055630e2927ee8fd17702b1d330795a58bca",
                "route": "onChat",
                "timestamp": 1530501870000,
                "type": "text",
                "__route__": "chat.chatHandler.send"
            }
        },
        {
            "_offline_count": 3,
            "member": {
                "_id": "5b28e87ac12fcb2623e24fd7",
                "name": "18705928625",
                "avatar": "http://cdn-public-test.tlifang.com/upload/avatar/46d45b97-aa79-4028-83f0-cb0226535a59.jpg"
            },
            "message": {
                "_id": "5b436de871e08f60d73e5168",
                "content": "哈哈哈",
                "from": "5b28db89c12fcb2623e24fbe",
                "target": "5b28e87ac12fcb2623e24fd7",
                "roomid": "0a8c78d2888418c05bed06372228d8fac69d4bca",
                "route": "onChat",
                "timestamp": 1531145704080,
                "type": "text",
                "__route__": "chat.chatHandler.send"
            }
        }
    ],
    "message": ""
}
```