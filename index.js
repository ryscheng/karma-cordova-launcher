var fs = require('fs');
var spawn = require('child-process-promise').spawn;
var ncp = require('ncp').ncp;
ncp.limit = 16;
var BIN = 'cordova';
var CORDOVA_DIR = '/tmp/cordova_test';
var TEMPLATE_DIR = __dirname + '/' + 'template/';

function runCordovaCmd(args) {
  return spawn(BIN, args, {
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

var Cordova = function(id, emitter, args, logger, config) {
  var self = this;
  self.settings = config.cordovaSettings;
  self.log = logger.create('launcher.cordova');
  self.name = self.platform + " on Cordova";

  console.log(self.settings);

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
        newUrl = newUrl.replace(/localhost/g, "10.0.2.2");
        var toWrite = read_data.toString().replace(/NEWURL/g, newUrl);
        fs.writeFile(CORDOVA_DIR + "/www/js/inserttest.js", toWrite, function (write_err) {
          if (write_err) {
            errorHandler(write_err);
            return;
          }
          var platforms = self.settings.platforms;
          var plugins = self.settings.plugins;
          var promise;

          if (typeof plugins !== 'undefined') {
            promise = runCordovaCmd(['plugin', 'add'].concat(plugins)).fail(errorHandler);
          } else {
            promise = runCordovaCmd(['plugin', 'add', 'org.apache.cordova.console']).fail(errorHandler);
          }
      
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
              runCordovaCmd(['emulate', platforms[i]], errorHandler); 
            }
          }, errorHandler);

        });
      });
    });
  };

  this.kill = function(done) {
    self.log.debug("Killing");
    done();
  };
  
  this.toString = function() {
    return self.name;
  };

};

// PUBLISH DI MODULE
module.exports = {
  'launcher:Cordova': ['type', Cordova]
};
