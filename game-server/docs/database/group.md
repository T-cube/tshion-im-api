# Collection chat.group
document
```
{
  _id: ObjectId
  name: String
  creator: ObjectId
  owner: ObjectId
  roomid: String
  create_at: Date,
  update_at: Date
}
```

# Collection chat.group.setting
document
```
{
  _id: ObjectId
  group: ObjectId
  level: Array
  status: Enum('normaQl', 'frozen', 'disabled', 'deleted')
  type: Enum('normal', 'temporary', 'advanced', 'super')
  create_at: Date
  update_at: Date
}
```

# Collection chat.group.member
document
```
{
  _id: ObjectId
  group: ObjectId
  uid: ObjectId
  name: String
  avatar: URL
  create_at: Date
  update_at: Date
  type: Enum('normal', 'admin', 'owner')
  status: Enum('normal', 'frozen', 'block', 'nspeak')
  level: Enum
}
```