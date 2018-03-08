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