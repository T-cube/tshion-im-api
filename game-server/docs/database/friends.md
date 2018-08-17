# Collection friend
document
```
{
  _id: ObjectId
  friends: ObjectId[]
  user: ObjectId
}
```

# Collection friend.info
document
```
{
  _id: ObjectId
  user: ObjectId
  friend: ObjectId
  nickname: String
  setting: Object{
    not_distub : 0 || 1,
    block: 0 || 1
  }
}
```

# Collection friend.group
document
```
{
  _id: ObjectId
  members: ObjectId[]
  type: Enum['normal', 'default', 'custom']
  user: ObjectId
  name: String
}
```

# Collection friend.request
document
```
{
  _id: ObjectId
  from: ObjectId
  receiver: ObjectId
  mark: String
  status: Enum
  create_at: Date
  update_at: Date
}
```