# Collection file
document
```
{
  copy: file.cache._id, // 缓存副本
  createAt: Timestamp,  // 创建时间
  duration: Number,     // 时长（音视频文件具有）
  extensions: String,   // 后缀名
  filename: String,     // 文件名
  hash: String,         // 文件hash值
  mimeType: String,     // 文件的 mime-type
  size: Number,         // 文件大小
  url: String           // 文件存储地址
}
```


# Collection file.cache
document
```
{
  cdn: {                // 七牛存储内容
    key: String,        // 七牛存储访问值key，
    hash: String,       // 七牛文件缓存hash
    server_url: String  // 七牛远程访问地址库

  },
  createAt: Timestamp,  // 创建时间
  duration: Number,     // 时长（音视频文件具有）
  extensions: String,   // 后缀名
  filename: String,     // 文件名
  hash: String,         // 文件hash值
  mimeType: String,     // 文件的 mime-type
  size: Number,         // 文件大小
  url: String           // 文件存储地址
}
```