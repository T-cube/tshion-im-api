# Collection account
```
{
  _id: ObjectId
  cid: String,                          // discard 用户系统的_id
  client: Enum('web','ios','android'),  // 用户所在客户端
  deviceToken: String,                  // 用户设备标识符
  uid: String,                          // 用户绑定标识
  brand: String                         // 手机品牌 ,'xiaomi', 'meizu', 'apple' ...
}
```
