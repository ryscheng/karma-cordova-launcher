var fs = require('fs');
var spawn = require('child-process-promise').spawn;
var ncp = require('ncp').ncp;
ncp.limit = 16;
var BIN = 'cordova';
var CORDOVA_DIR = '/tmp/cordova_test';
var TEMPLATE_DIR = __dirname + '/' + 'template/';

function runCordovaCmd(args) {
  var binary, arguments;

  // MB-2014-06-24: solution to detect windows as proposed here:
  // http://stackoverflow.com/a/8684009/2167000
  if (/^win/.test(process.platform)) {
    binary = 'cmd.exe'
    arguments = ['/C', 'cordova ' + args.join(' ')];
  } else {
    arguments = args;
    binary = BIN;
  }

  return spawn(binary, arguments, {
    cwd: CORDOVA_DIR
  }).progress(function(childProcess) {
    childProcess.stdout.on('data', function(data) {
      console.log('[spawn] stdout: ' + data.toString().trim());
    });
    childProcess.stderr.on('data', function(data) {
      console.error('[spawn] stderr: ' + data.toString().trim());
    });
  });
}

var Cordova = function(id, emitter, args, logger, config, baseBrowserDecorator) {
  baseBrowserDecorator(this);
  var self = this;
  self.settings = config.cordovaSettings;
  self.log = logger.create('launcher.cordova');
  self.name = self.platform + " on Cordova";

  console.log('using settings: ', self.settings);

  emitter.on('exit', function(done){
    console.log("!!!EXITING!!!");
    done();
  });

  var errorHandler = function(err) {
    self.log.error(err);
    emitter.emit('browser_process_failure', self);
  };

  this.start = function(url) {
    self.log.debug("Starting at " + url);
    ncp(TEMPLATE_DIR, CORDOVA_DIR, function(ncp_err) {
      if (ncp_err) {
        errorHandler(ncp_err);
        return;
      }
      fs.readFile(CORDOVA_DIR + "/www/js/inserttest.js", function(read_err, read_data) {
        if (read_err) {
          errorHandler(read_err);
          return;
        }
        var newUrl = url + "?id=" + id;
        var ip = '10.0.2.2'; //default ip used by the Android emulator
        if(self.settings.hostip) {
          ip = self.settings.hostip;
        }
        newUrl = newUrl.replace(/localhost/g, ip);
        var toWrite = read_data.toString().replace(/NEWURL/g, newUrl);
        fs.writeFile(CORDOVA_DIR + "/www/js/inserttest.js", toWrite, function (write_err) {
          if (write_err) {
            errorHandler(write_err);
            return;
          }
          var platforms = self.settings.platforms;
          var plugins = self.settings.plugins;
          var mode = 'emulate';
          if(self.settings.mode){
            mode = self.settings.mode;
          }
          var target = '';
          if(self.settings.target){
            target = '--target='+self.settings.target;
          }
          var promise;

          if (typeof plugins === 'undefined') {
            plugins = ['cordova-plugin-console', 'cordova-plugin-whitelist'];
          } 
          promise = runCordovaCmd(['plugin', 'add'].concat(plugins)).fail(errorHandler);

          for (var i=0; i<platforms.length; i++) {
            promise = promise.then(
              runCordovaCmd.bind({}, ['platform', 'add', platforms[i]]),
              runCordovaCmd.bind({}, ['platform', 'add', platforms[i]])
            );
          }
          promise = promise.then(function(result) {
            console.log('Done adding platforms');
          }, function(err) {
            console.log('Done adding platforms');
          });

          promise = promise.then(runCordovaCmd.bind({}, ['build']), errorHandler);
          promise.then(function() {
            for (var i=0; i<platforms.length; i++) {
              var args = [mode, platforms[i]];
              if(target) args.push(target);
              runCordovaCmd(args, errorHandler);
            }
          }, errorHandler);

        });
      });
    });
  };
};

// PUBLISH DI MODULE
module.exports = {
  'launcher:Cordova': ['type', Cordova]
};
