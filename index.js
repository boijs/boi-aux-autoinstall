/**
 * 检查node module是否安装，且自动安装未安装模块
 */
'use strict';

require('shelljs/global');
let path = require('path');
let fs = require('fs');
let Promise = require("bluebird");
let chalk = require('chalk');

module.exports = function() {
    Promise.try(() => {
        return fs.readFileSync(path.join(process.cwd(), 'package.json'));
    }).then((info) => {
        if (!info) {
            reject('Can\'t resolve file ' + chalk.red('package.json') + '\n');
        }
        let _info = JSON.parse(info);
        return Object.assign({}, _info.dependencies, _info.devDependencies);
    }).then((modules) => {
        let _modulesNeedInstalled = [];
        for (module in modules) {
            try {
                require.resolve(path.posix.join(process.cwd(), 'node_modules', module));
            } catch (e) {
                try {
                    require.resolve(module);
                } catch (e) {
                    _modulesNeedInstalled.push(module);
                }
            }
        }
        if (_modulesNeedInstalled.length !== 0) {
            exec('npm install ' + _modulesNeedInstalled.join(' '));
        }
    }).catch((err) => {
        console.log(chalk.red(err));
        process.exit();
    });
};
