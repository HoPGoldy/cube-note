#!/usr/bin/env node  
import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import { actionRun } from './run'

const packageVersion = JSON.parse(fs.readFileSync(path.join(__dirname, '', '../../package.json'), 'utf8')).version
const program = new Command()

program.version(packageVersion)

program
    .command('run')
    .description('启动服务')
    .option('-s, --storage <storagePath>', '数据保存目录', process.cwd())
    .option('-p, --port <servePort>', '服务启动端口', process.env.NODE_ENV === 'development' ? '3600' : '3700')
    .action(actionRun)

program.parse(process.argv)