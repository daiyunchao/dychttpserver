import chalk from 'chalk'
import program from 'commander'
import Server from './server'
program.version('1.0.0');
program.option('-p, --port <val>', 'set server listen port');
program.option('-g, --gzip', 'Serve gzip files when possible[false]')
program.parse(process.argv);

let config = {
  port: 8080,
  gzip: false
}

Object.assign(config, program);
new Server(config).start()
