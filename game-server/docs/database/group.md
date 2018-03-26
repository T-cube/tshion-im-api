# Collection chat.group
document
```
{
  _id: ObjectId
  name: String
  creator: ObjectId
  members: ObjectIdArray
  roomid: String
  create_at: Date
  status: Enum('normal', 'frozen', 'disabled', 'deleted')
  type: Enum('normal', 'temporary', 'advanced', 'super')
}
```

# Collection chat.group.setting
document
```
{
  _id: ObjectId
  group: ObjectId
  level: Array
  create_at: Date
  update_at: Date
}
```

# Collection chat.group.member
document
```
{
  _id: ObjectId
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