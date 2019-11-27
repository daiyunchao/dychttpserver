import chalk from 'chalk'
import program from 'commander'
import Server from './server'
program.version('1.0.0');
program.option('-p, --port <val>', 'set server listen port');
program.option('-a, --address <val>', 'set server listen address [127.0.0.1]');
program.option('-c, --cache <val>', 'set cache max-age time [3600]');
program.option('-g, --gzip', 'Serve gzip files when possible[false]')
program.option('-o, --open', 'open brower when server start')
program.option('--cors', 'enable cors via the access-control-allow-origin header')
program.option('-S, --ssl', 'enable https')
program.option('-C, --cert <val>', 'path to ssl cert file[./cert.pem]');
program.option('-K, --key <val>', 'path to ssl key file[./key.pem]');
program.parse(process.argv);

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
  cors: false,
}

Object.assign(config, program);
if (program.port) {
  //用户自定义port
  config.portIsFixed = true;
}
new Server(config).start()
