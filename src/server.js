import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import http from 'http';
import url from 'url'
import mime from 'mime'
import ejs from 'ejs'
let { stat, readdir, readFile } = fs.promises;

class Server {
  constructor(config) {
    this.config = config;
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
        this.sendFile(filepath, res);
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

  sendFile(filepath, res) {
    res.statusCode = 200;
    let type = mime.getType(filepath)
    res.setHeader('Content-Type', `${type};charset=utf-8`);
    fs.createReadStream(filepath).pipe(res);
  }
  sendError(e, res) {
    console.log(e);
    res.statusCode = 404;
    res.end('Not Found');
  }
  start() {
    http.createServer(this.handlerRequest.bind(this)).listen(this.config.port, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log(`${chalk.yellow('Starting up http-server, serving')} ${chalk.blue('./')}
Available on:
    http://127.0.0.1:${chalk.green(this.config.port)}
Hit CTRL-C to stop the server
        `);

    });
  }
}

export default Server;

