var assert = require('assert');
var util = require('util');
var fhc = require('fh-fhc');
var async = require('async');
var sys = require('sys');

// Sample script to do the following:
// - APP_GUID env var is passed in
// - Run the server side tests
// - Do an Android build of the App

fhc.fhc.load(function (err) {
  if (err) return fatal("Unexpected error loading FHC: " + err);

  // check we have APPGUID
  var appId = process.env['APPGUID'];
  if (!appId) return fatal("Please set the 'APPGUID' environment variable");
  console.log("Using App: " + appId);

  // Check the App exists ('dev' environment by default)
  fhc.read([appId], function(err, app){
    if(err) return fatal("Problem reading App, guid: " + appId + " - " + util.inspect(err));
  
    // Run the server side tests
    runServerSideTests(appId, function(err){
      if(err) return fatal("Error running tests: " + util.inspect(err));
      console.log("All server side tests ok..");
      
      // Do Android build of the app
      doAndroidBuild(appId, function(err, url, downloadFile){
        if(err) fatal(err);
        console.log("Android build complete..");
        console.log("APK Url: " + url);
        console.log("File: " + downloadFile);
      });
    });
  });
});

// utility function
function fatal(msg) {
  console.error(msg);
  process.exit(1);
}

// Run a very basic server side test
function runServerSideTests(appId, cb){
  async.series([
    function (callback) {
      var args = [appId, 'getConfig'];
      fhc.act(args, function (err, data) {
        if (err) return cb(err);
        assert.ok(data.config, "Config not defined: " + util.inspect(data));
        return callback(undefined, 'test getConfig finished ok');
      });
    }
  ], function (err, results) {
    if (err) return cb(err);
    return cb(undefined, results);
  });  
};

function doAndroidBuild(appId, cb){
  if(process.env['nobuild']){
    console.log("NOTE: 'nobuild' flag specified, ignoring App build");
    return cb();  
  }
 
  // Note: make sure your key and cert passes match here..
  var params = ['app=' + appId, 'destination=android', 'version=2.2',
                'config=release', 'keypass=123456789', 'certpass=123456789', 'download=true'];
  console.log("Kicking off Android build: " + params);

  fhc.build(params, function(err, data) {
    if(err) return cb(err);
    // console.log("Build data: " + util.inspect(data, true, null));
    var url =  data[0][0].action.url;
    var downloadFile = data[1].download.file;
    return cb(undefined, url, downloadFile);
  });
};