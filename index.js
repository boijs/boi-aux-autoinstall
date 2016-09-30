/**
 * @module
 * @desc 检查modules是否安装，自动安装未安装模块
 * @author zhoujunpeng
 */
'use strict';
require('shelljs/global');
let path = require('path');
let fs = require('fs');
let Promise = require("bluebird");
let chalk = require('chalk');
let _ = require('lodash');

const DEFAULT_OPTIONS = {
  // 需要安装的模块
  modules: [],
  // 是否自动检查packa.json收集的依赖包安装情况
  autoCheck: true
};

// npm淘宝镜像
const NPM_REGISTRY = 'https://registry.npm.taobao.org';
// 检测cnpm是否可用
const CNPM_AVALIABLE = !isNaN(parseInt(exec('cnpm -v')));

module.exports = function(options) {
  let _options = options || Object.assign({}, DEFAULT_OPTIONS);
  Promise.try(() => {
    let _modulesNeedChecked = [];
    console.log(chalk.cyan.bold('==> Checking dependencies...'));
    // 储存指定的modules
    if (_options.modules && _options.modules.length !== 0) {
      _modulesNeedChecked = _modulesNeedChecked.concat(_options.modules);
    }
    return _modulesNeedChecked;
  }).then((modules) => {
    let _modulesNeedInstalled = [];
    let _baseDir = path.posix.join(process.cwd(),'node_modules');
    // 检查依赖包本地是否已安装
    if (modules && modules.length !== 0) {
      modules.forEach(function(module) {
        try {
          // 检查项目node_modules目录
          require.resolve(path.posix.join(_baseDir,module));
        } catch (e) {
          try{
            // 检测全局，nvm环境无效
            require.resolve(module);
          }catch(e){
            _modulesNeedInstalled.push(module);
          }
        }
      });
    }
    return _modulesNeedInstalled;
  }).then((modules) => {
    let showLog = true;
    // autoCheck为true时执行一次package.json依赖包检测
    if (_options.autoCheck) {
      console.log(chalk.cyan.bold('==> Installing dependencies...'));
      showLog = false;
      if(CNPM_AVALIABLE){
        exec('cnpm install');
      }else{
        exec('npm install --registry='+NPM_REGISTRY);
      }
    }
    // 安装package.json未收集的依赖包
    if (modules && modules.length !== 0) {
      showLog && console.log(chalk.cyan.bold('==> Installing dependencies...'));
      showLog = false;
      if(CNPM_AVALIABLE){
        exec('cnpm install ' + modules.join(' '));
      }else{
        exec('npm install ' + modules.join(' ') + ' --save --registry='+NPM_REGISTRY);
      }
    }
    console.log(chalk.cyan.bold('==> All dependencies have been installed'));
  }).catch((err) => {
    console.log(chalk.red(err.stack));
    process.exit();
  });
};
