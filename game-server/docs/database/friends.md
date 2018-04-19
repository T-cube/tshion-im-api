# Collection friend
document
```
{
  _id: ObjectID
  friends: ObjectID
  user: ObjectID
}
```

# Collection friend.info
document
```
{
  _id: ObjectID
  user: ObjectID
  friend: ObjectID
  nickname: String
  setting: Object{

  }
}
```

# Collection friend.group
document
```
{
  _id: ObjectID
  members: ObjectID[]
  type: Enum['normal', 'default', 'custom']
  user: ObjectID
  name: String
}
```

# Collection friend.request
document
```
{
  _id: ObjectID
  from: ObjectID
  receiver: ObjectID
  mark: String
  status: Enum
  create_at: Date
  update_at: Date
}
```