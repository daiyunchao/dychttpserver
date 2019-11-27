import chalk from 'chalk'
import program from 'commander'
import Server from './server'
program.version('1.0.0');
program.option('-p, --port <val>', 'set server listen port');
program.option('-a, --address <val>', 'set server listen address [127.0.0.1]');
program.option('-g, --gzip', 'Serve gzip files when possible[false]')
program.parse(process.argv);

let config = {
  port: 8080,
  gzip: false,
  portIsFixed: false,
  address: "127.0.0.1"
}

Object.assign(config, program);
if (program.port) {
  //用户自定义port
  config.portIsFixed = true;
}
new Server(config).start()
