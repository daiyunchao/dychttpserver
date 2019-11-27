### dychttpserver
- 防`http-server`在当前目录中创建一个静态服务器
  
#### 如何使用
1. 下载全部包 `npm -i dychttpserver -g` 或是 `yarn global add dychttpserver`
2. 在任意目录中使用`dychttpserver`即可


#### 已有功能:
```javascript
dychttpserver --help
dychttpserver -p 8081 (默认为8080)
dychttpserver -g (是否开启gzip压缩,不传不开启)
dychttpserver -a (要绑定的地址)
dychttpserver -c (设置缓存的max-age的时间单位秒)
dychttpserver -o (启动服务器时打开浏览器)
```