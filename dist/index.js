"use strict";

var _chalk = _interopRequireDefault(require("chalk"));

var _commander = _interopRequireDefault(require("commander"));

var _server = _interopRequireDefault(require("./server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version('1.0.0');

_commander.default.option('-p, --port <val>', 'set server listen port');

_commander.default.parse(process.argv);

let config = {
  port: 8080
};
Object.assign(config, _commander.default);
new _server.default(config).start();