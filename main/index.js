// Generated by CoffeeScript 1.10.0

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var GitCommands, IS_DEBUG, Minimist, Options, PackageFile, Promise, askConfirmUpdate, askReleaseType, incrementVersion, writeNewReadme;

  IS_DEBUG = process.env.IS_DEBUG != null;

  Promise = require('bluebird');

  Minimist = require('minimist');

  Options = require('./lib/Options');

  GitCommands = require('./lib/GitCommands');

  PackageFile = require('./lib/PackageFile');

  askReleaseType = require('./lib/askReleaseType');

  incrementVersion = require('./lib/incrementVersion');

  askConfirmUpdate = require('./lib/askConfirmUpdate');

  writeNewReadme = require('./lib/writeNewReadme');

  module.exports = function(args) {
    var options, package_file;
    options = new Options();
    package_file = new PackageFile();
    return Promise["try"](function() {
      return args.slice(2);
    }).then(Minimist).then(function(args) {
      return options.parseArgs(args);
    }).then(function() {
      return IS_DEBUG || GitCommands.checkForCleanWorkingDirectory();
    }).then(function() {
      if (!options.release_type) {
        return askReleaseType().then(function(release_type) {
          return options.release_type = release_type;
        });
      }
    }).then(function() {
      return package_file.load(options.package_file_location);
    }).then(function() {
      if (!options.current_version) {
        options.current_version = package_file.get('version');
      }
      return options.next_version = incrementVersion(options.current_version, options.release_type);
    }).then(function() {
      return options.no_confirm || (askConfirmUpdate(options.current_version, options.next_version));
    }).then(function(do_update) {
      if (!do_update) {
        throw new Error('Update Canceled');
      }
    }).then(function() {
      if (IS_DEBUG) {
        console.log("Would have written to " + options.next_version + " to \n" + options.package_file_location + "\n" + options.readme_file_location);
        throw new Error('But, your in debug mode so nothing actually happened');
      }
    }).then(function() {
      return GitCommands.preCommands(options.next_version, options.skip_git_pull);
    }).then(function() {
      return writeNewReadme(options.readme_file_location, options.current_version, options.next_version);
    }).then(function() {
      package_file.set('version', options.next_version);
      return package_file.save();
    }).then(function() {
      var files;
      files = [options.readme_file_location, options.package_file_location];
      return GitCommands.postCommands(options.next_version, files, options.skip_git_push);
    })["catch"](function(err) {
      if (IS_DEBUG) {
        throw err;
      }
      console.log(err.message);
      return process.exit(1);
    });
  };

}).call(this);
