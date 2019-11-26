import chalk from 'chalk'
import program from 'commander'
import Server from './server'
program.version('1.0.0');
program.option('-p, --port <val>', 'set server listen port');
program.parse(process.argv);

let config = {
  port: 8080
}

Object.assign(config, program);
new Server(config).start()
