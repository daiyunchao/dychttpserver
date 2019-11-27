import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import http from 'http';
import url from 'url'
import mime from 'mime'
import ejs from 'ejs'
import zlib from 'zlib'
let { stat, readdir, readFile } = fs.promises;

class Server {
  constructor(config) {
    this.config = config;
    process.on('uncaughtException', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        //端口被占用了
        if (this.config.portIsFixed) {
          throw err;
        } else {
          this.config.port += 1;
          this.start();
        }
      } else {
        console.log("err==>",err);
        throw err;
      }
    })
  }
  async handlerRequest(req, res) {
    let { pathname } = url.parse(req.url);
    //判断文件或是文件夹是否存在,如果不存在,返回404
    //判断是文件还是文件夹
    //如果是文件夹则读取文件夹中的文件列表并显示
    //如果是文件直接输出文件

    try {
      if (pathname === '/favicon.ico') {
        return res.end();
      }
      let filepath = path.join(process.cwd(), pathname);
      let statObj = await stat(filepath);
      if (statObj.isFile()) {
        //输出文件
        this.sendFile(filepath, req, res);
      } else {
        //是文件夹
        //显示一个文件的列表
        let dirs = await this.readDir(filepath);
        await this.renderDirs(dirs, pathname, res);
      }
    } catch (error) {
      return this.sendError(error, res);
    }
  }
  async readDir(dirpath) {
    return await readdir(dirpath);
  }

  async renderDirs(dirs, pathname, res) {
    let templateHtml = await readFile(path.join(__dirname, '../', 'public/template.ejs'), 'utf8');
    let html = ejs.render(templateHtml, { dirs, path: pathname === '/' ? '' : pathname });
    res.statusCode = 200;
    res.setHeader('Content-Type', `text/html;charset=utf-8`);
    res.write(html)
  }

  //判断是否需要启用gzip压缩
  gzip(req, res) {
    if (!this.config.gzip) {
      return false;
    }
    let acceptEncoding = req.headers['accept-encoding'];
    if (acceptEncoding.indexOf('gzip') > -1) {
      //说明客户端支持gzip压缩功能
      res.setHeader('Content-Encoding', 'gzip');
      return zlib.createGzip();
    }
    return false;

  }

  async cache(filepath, req, res) {
    res.setHeader('Cache-Control', `max-age=${this.config.cache}`)
    let statObj = await stat(filepath);
    let time = statObj.ctime;
    res.setHeader('Last-Modified', time.toString());
    let ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && ifModifiedSince == time) {
      res.statusCode = 304;
    }
  }
  sendFile(filepath, req, res) {
    let type = mime.getType(filepath)
    res.setHeader('Content-Type', `${type};charset=utf-8`);
    //添加缓存
    this.cache(filepath,req,res);
    let useGzip = this.gzip(req, res);
    if (useGzip) {
      fs.createReadStream(filepath).pipe(useGzip).pipe(res);
    } else {
      fs.createReadStream(filepath).pipe(res);
    }

  }
  sendError(e, res) {
    console.log(e);
    res.statusCode = 404;
    res.end('Not Found');
  }
  start() {
    let server = http.createServer(this.handlerRequest.bind(this));
    server.listen({
      port: this.config.port,
      host: this.config.address
    }, () => {
      console.log(`${chalk.yellow('Starting up http-server, serving')} ${chalk.blue('./')}
Available on:
    http://${this.config.address}:${chalk.green(this.config.port)}
Hit CTRL-C to stop the server
        `);
    });
  }

}

export default Server;

