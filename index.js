const Fs = require('fs');
const Path = require('path');
const Shell = require('shelljs');
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
    return;
  }

  // check if cnpm is available
  const CNPM_AVALIABLE = !!(Shell.exec('cnpm -v', {
    silent: true
  }).stdout);

  return BoiUtils.log.loading(new Promise((resolve, reject) => {
    try {
      if (modules && modules.length !== 0) {
        if (CNPM_AVALIABLE) {
          Shell.exec(`cnpm install ${modules.join(' ')} --save-dev`, {
            silent: true
          }, () => {
            Fs.writeFileSync(Path.join(process.cwd(), '.boirc'), JSON.stringify({
              dependencies: modules
            }));
            resolve({
              msg: 'Install dependencies successfully'
            });
          });
        } else {
          Shell.exec(`npm install ${modules.join(' ')} --save-dev --registry=${NPM_REGISTRY}`, {
            silent: true
          }, () => {
            Fs.writeFileSync(Path.join(process.cwd(), '.boirc'), JSON.stringify({
              dependencies: modules
            }));
            resolve({
              msg: 'Install dependencies successfully'
            });
          });
        }
      }
    } catch (e) {
      reject(e || 'Install dependencies fails');
    }
  }), 'Installing dependencies...');
};