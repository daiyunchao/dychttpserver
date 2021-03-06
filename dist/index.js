"use strict";

var _chalk = _interopRequireDefault(require("chalk"));

var _commander = _interopRequireDefault(require("commander"));

var _server = _interopRequireDefault(require("./server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version('1.0.0');

_commander.default.option('-p, --port <val>', 'set server listen port');

_commander.default.option('-a, --address <val>', 'set server listen address [127.0.0.1]');

_commander.default.option('-c, --cache <val>', 'set cache max-age time [3600]');

_commander.default.option('-g, --gzip', 'Serve gzip files when possible[false]');

_commander.default.option('-o, --open', 'open brower when server start');

_commander.default.option('--cors', 'enable cors via the access-control-allow-origin header');

_commander.default.option('-S, --ssl', 'enable https');

_commander.default.option('-C, --cert <val>', 'path to ssl cert file[./cert.pem]');

_commander.default.option('-K, --key <val>', 'path to ssl key file[./key.pem]');

_commander.default.parse(process.argv);

let config = {
  port: 8080,
  gzip: false,
  portIsFixed: false,
  address: "127.0.0.1",
  cache: 3600,
  open: false,
  ssl: false,
  cert: "./cert.pem",
  key: "./key.pem",
  cors: false
};
Object.assign(config, _commander.default);

if (_commander.default.port) {
  //用户自定义port
  config.portIsFixed = true;
}

new _server.default(config).start();