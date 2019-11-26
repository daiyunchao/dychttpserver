"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _http = _interopRequireDefault(require("http"));

var _url = _interopRequireDefault(require("url"));

var _mime = _interopRequireDefault(require("mime"));

var _ejs = _interopRequireDefault(require("ejs"));

var _zlib = _interopRequireDefault(require("zlib"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let {
  stat,
  readdir,
  readFile
} = _fs.default.promises;

class Server {
  constructor(config) {
    this.config = config;
  }

  async handlerRequest(req, res) {
    let {
      pathname
    } = _url.default.parse(req.url); //判断文件或是文件夹是否存在,如果不存在,返回404
    //判断是文件还是文件夹
    //如果是文件夹则读取文件夹中的文件列表并显示
    //如果是文件直接输出文件


    try {
      if (pathname === '/favicon.ico') {
        return res.end();
      }

      let filepath = _path.default.join(process.cwd(), pathname);

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
    let templateHtml = await readFile(_path.default.join(__dirname, '../', 'public/template.ejs'), 'utf8');

    let html = _ejs.default.render(templateHtml, {
      dirs,
      path: pathname === '/' ? '' : pathname
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', `text/html;charset=utf-8`);
    res.write(html);
  } //判断是否需要启用gzip压缩


  gzip(req, res) {
    if (!this.config.gzip) {
      return false;
    }

    let acceptEncoding = req.headers['accept-encoding'];

    if (acceptEncoding.indexOf('gzip') > -1) {
      //说明客户端支持gzip压缩功能
      res.setHeader('Content-Encoding', 'gzip');
      return _zlib.default.createGzip();
    }

    return false;
  }

  sendFile(filepath, req, res) {
    res.statusCode = 200;

    let type = _mime.default.getType(filepath);

    res.setHeader('Content-Type', `${type};charset=utf-8`);
    let useGzip = this.gzip(req, res);

    if (useGzip) {
      _fs.default.createReadStream(filepath).pipe(useGzip).pipe(res);
    } else {
      _fs.default.createReadStream(filepath).pipe(res);
    }
  }

  sendError(e, res) {
    console.log(e);
    res.statusCode = 404;
    res.end('Not Found');
  }

  start() {
    _http.default.createServer(this.handlerRequest.bind(this)).listen(this.config.port, err => {
      if (err) {
        return console.log(err);
      }

      console.log(`${_chalk.default.yellow('Starting up http-server, serving')} ${_chalk.default.blue('./')}
Available on:
    http://127.0.0.1:${_chalk.default.green(this.config.port)}
Hit CTRL-C to stop the server
        `);
    });
  }

}

var _default = Server;
exports.default = _default;