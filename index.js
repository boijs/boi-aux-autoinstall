const Fs = require('fs');
const Path = require('path');
const Shell = require('shelljs');
const Utils = require('util');
const BoiUtils = require('boi-utils');

// cnpm registry
const NPM_REGISTRY = 'https://registry.npm.taobao.org';

/**
 * @module boi/aux-autoinstall
 * @param {boolean} isInstall whether need install modules automatically
 * @param {Array} modules modules that need to be installed
 * @return {Promise}
 */
module.exports = function (isInstall, modules) {
  // install when isInstall is true or .boirc file not exists
  const NeedInstallDeps = isInstall || !Fs.existsSync(Path.join(process.cwd(), '.boirc'));

  if (!NeedInstallDeps) {
    // return empty promise if not need install
    return new Promise(resolve => {
      resolve();
    });
  }

  return BoiUtils.log.loading(new Promise((resolve, reject) => {
    try {
      if (modules && modules.length !== 0) {
        Shell.exec(`npm install ${modules.join(' ')} --save-dev --registry=${NPM_REGISTRY}`, {
          silent: true
        }, () => {
          Fs.writeFileSync(Path.join(process.cwd(), '.boirc'), Utils.inspect({
            dependencies: modules
          }));
          resolve({
            msg: 'Install dependencies succeed'
          });
        });
      }
    } catch (e) {
      reject(e || 'Install dependencies fails');
    }
  }), 'Installing dependencies...');
};