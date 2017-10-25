'use strict';

require('shelljs/global');

const _ = require('lodash');
const Ora = require('ora');
const Chalk = require('chalk');
const Promise = require("bluebird");

const DEFAULT_OPTIONS = {
  // 需要安装的模块
  modules: [],
  // 是否自动检查package.json收集的依赖包安装情况
  autoCheck: true
};

// npm淘宝镜像
const NPM_REGISTRY = 'https://registry.npm.taobao.org';

module.exports = function (options) {
  // 检测cnpm是否可用
  const CNPM_AVALIABLE = !!(exec('cnpm -v',{silent:true}).stdout);

  let spinner = Ora(Chalk.cyan.bold('Checking dependencies...')).start();;

  let _options = options || Object.assign({}, DEFAULT_OPTIONS);
  Promise.try(() => {
    let _modulesNeedChecked = [];
    // 储存指定的modules
    if (_options.modules && _options.modules.length !== 0) {
      _modulesNeedChecked = _modulesNeedChecked.concat(_options.modules);
    }
    return _modulesNeedChecked;
  }).then((modules) => {
    let _modulesNeedInstalled = [];
    // 检查依赖包本地是否已安装
    if (modules && modules.length !== 0) {
      modules.forEach(function (module) {
        try {
          require.resolve(module.split('@')[0]);
        } catch (e) {
          _modulesNeedInstalled.push(module);
        }
      });
    }
    return _modulesNeedInstalled;
  }).then((modules) => {
    // autoCheck为true时执行一次package.json依赖包检测
    if (_options.autoCheck) {
      if (CNPM_AVALIABLE) {
        exec('cnpm install', {
          silent: true
        });
      } else {
        exec('npm install --registry=' + NPM_REGISTRY, {
          silent: true
        });
      }
    }
    // 安装package.json未收集的依赖包
    if (modules && modules.length !== 0) {
      if (CNPM_AVALIABLE) {
        exec(`cnpm install ${modules.join(' ')} --save-dev`, {
          silent: true
        });
      } else {
        exec(`npm install ${modules.join(' ')} --save-dev --registry=${NPM_REGISTRY}`, {
          silent: true
        });
      }
    }
    spinner.succeed(Chalk.cyan.bold('All dependencies have been installed\n'));
  }).catch((err) => {
    spinner.fail(Chalk.red(err.stack));
    process.exit(1);
  });
};
