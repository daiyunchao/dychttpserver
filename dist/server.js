"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _https = _interopRequireDefault(require("https"));

var _http = _interopRequireDefault(require("http"));

var _url = _interopRequireDefault(require("url"));

var _mime = _interopRequireDefault(require("mime"));

var _ejs = _interopRequireDefault(require("ejs"));

var _zlib = _interopRequireDefault(require("zlib"));

var _open = _interopRequireDefault(require("open"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let {
  stat,
  readdir,
  readFile
} = _fs.default.promises;

class Server {
  constructor(config) {
    this.config = config;
    process.on('uncaughtException', err => {
      if (err && err.code === 'EADDRINUSE') {
        //端口被占用了
        if (this.config.portIsFixed) {
          throw err;
        } else {
          this.config.port += 1;
          this.start();
        }
      } else {
        throw err;
      }
    });
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

      console.log(`时间: ${new Date().toLocaleString()}, 访问路径: ${pathname}, 用户代理: ${req.headers["user-agent"]}`);

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
    this.cors(res);
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

  async cache(filepath, req, res) {
    res.setHeader('Cache-Control', `max-age=${this.config.cache}`);
    let statObj = await stat(filepath);
    let time = statObj.ctime;
    res.setHeader('Last-Modified', time.toString());
    let ifModifiedSince = req.headers['if-modified-since'];

    if (ifModifiedSince && ifModifiedSince == time) {
      res.statusCode = 304;
    }
  }

  cors(res) {
    if (this.config.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }

  sendFile(filepath, req, res) {
    let type = _mime.default.getType(filepath);

    res.setHeader('Content-Type', `${type};charset=utf-8`); //添加缓存

    this.cache(filepath, req, res); //是否跨域

    this.cors(res);
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
    console.log("this.config.ssl===>", this.config.ssl);
    this.config.ssl ? this.startHttps() : this.startHttp();
  }

  startHttps() {
    let certPath = this.config.cert.indexOf("/") == 0 ? this.config.cert : _path.default.join(process.cwd(), this.config.cert);
    let keyPath = this.config.key.indexOf("/") == 0 ? this.config.key : _path.default.join(process.cwd(), this.config.key);

    let certFile = _fs.default.readFileSync(certPath, 'utf8');

    let keyFile = _fs.default.readFileSync(keyPath, 'utf8');

    let credentials = {
      key: keyFile,
      cret: certFile
    };

    let server = _https.default.createServer(credentials, this.handlerRequest.bind(this));

    server.listen({
      port: this.config.port,
      host: this.config.address
    }, this.startCallback.bind(this));
  }

  startHttp() {
    let server = _http.default.createServer(this.handlerRequest.bind(this));

    server.listen({
      port: this.config.port,
      host: this.config.address
    }, this.startCallback.bind(this));
  }

  startCallback() {
    let protocol = this.config.ssl ? "https" : "http";
    console.log(`${_chalk.default.yellow('Starting up dychttpserver, serving')} ${_chalk.default.blue('./')}
Available on:
    ${protocol}://${this.config.address}:${_chalk.default.green(this.config.port)}
Hit CTRL-C to stop the server
        `);

    if (this.config.open) {
      (0, _open.default)(`${protocol}://${this.config.address}:${this.config.port}`);
    }
  }

}

var _default = Server;
exports.default = _default;