// Generated by CoffeeScript 1.12.5

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var GitCommands, GitResetError, HelpError, IS_DEBUG, Observatory, Options, PackageFile, Path, Promise, askConfirmUpdate, askReleaseMessage, askReleaseType, gitFlowSettings, globNormalize, incrementVersion, replaceVersionInFile, runArbitraryCommand;

  IS_DEBUG = process.env.IS_DEBUG != null;

  Promise = require('bluebird');

  Path = require('path');

  Observatory = require('observatory');

  Options = require('./lib/Options');

  GitCommands = require('./lib/GitCommands');

  PackageFile = require('./lib/PackageFile');

  GitResetError = require('./lib/error/GitResetError');

  HelpError = require('./lib/error/HelpError');

  askReleaseType = require('./lib/question/askReleaseType');

  askConfirmUpdate = require('./lib/question/askConfirmUpdate');

  askReleaseMessage = require('./lib/question/askReleaseMessage');

  gitFlowSettings = require('./lib/helper/gitFlowSettings');

  incrementVersion = require('./lib/helper/incrementVersion');

  replaceVersionInFile = require('./lib/helper/replaceVersionInFile');

  runArbitraryCommand = require('./lib/helper/runArbitraryCommand');

  globNormalize = require('./lib/helper/globNormalize');

  module.exports = function(args) {
    return Promise.bind({
      options: void 0,
      package_file: void 0,
      git_flow_settings: void 0,
      git_commands: void 0,
      observatory_tasks: void 0,
      release_message: void 0
    }).then(function() {
      return this.options = new Options(args);
    }).then(function() {
      if (this.options.show_help) {
        throw new HelpError;
      }
    }).then(function() {
      return this.git_flow_settings = gitFlowSettings(Path.resolve('./'));
    }).then(function() {
      return GitCommands.checkForCleanWorkingDirectory();
    }).then(function() {
      if (!this.options.next_version) {
        if (!this.options.release_type) {
          return askReleaseType().then((function(_this) {
            return function(release_type) {
              return _this.options.release_type = release_type;
            };
          })(this));
        }
      }
    }).then(function() {
      this.package_file = new PackageFile(this.options.package_file_location);
      this.package_file.load();
      if (!this.options.current_version) {
        return this.options.current_version = this.package_file.getVersion();
      }
    }).then(function() {
      if (!this.options.next_version) {
        return this.options.next_version = incrementVersion(this.options.current_version, this.options.release_type);
      }
    }).then(function() {
      if (this.options.release_message === true) {
        return askReleaseMessage(this.options.next_version);
      } else {
        return this.options.release_message.replace('{version}', this.options.next_version);
      }
    }).then(function(text) {
      return this.release_message = text;
    }).then(function() {
      if (!this.options.no_confirm) {
        return askConfirmUpdate(this.options.current_version, this.options.next_version);
      } else {
        return true;
      }
    }).then(function(confirmed) {
      if (!confirmed) {
        throw new Error('Update canceled');
      }
    }).then(function() {
      if (!this.options.quiet) {
        Observatory.settings({
          prefix: '[Generate Release] '
        });
        return this.observatory_tasks = {
          git_pull: Observatory.add('GIT: Pull from Origin'),
          git_start: Observatory.add('GIT: Start Release'),
          write_files: Observatory.add('Files: Write New Version'),
          pre_commit_commands: Observatory.add('Commands: Pre Commit'),
          git_commit: Observatory.add('GIT: Commit Files'),
          post_commit_commands: Observatory.add('Commands: Post Commit'),
          git_finish: Observatory.add('GIT: Finish Release'),
          git_push: Observatory.add('GIT: Push to Origin'),
          post_complete_commands: Observatory.add('Commands: Post Complete')
        };
      }
    }).then(function() {
      return this.git_commands = new GitCommands({
        master_branch: this.git_flow_settings.master,
        develop_branch: this.git_flow_settings.develop,
        current_version: this.options.current_version,
        next_version: this.options.next_version,
        release_message: this.release_message,
        remote: this.options.remote,
        skip_git_flow_finish: this.options.skip_git_flow_finish
      });
    }).then(function() {
      if (!this.options.skip_git_pull) {
        if (!this.options.quiet) {
          this.observatory_tasks.git_pull.status('Pulling');
        }
        this.git_commands.pull();
        if (!this.options.quiet) {
          return this.observatory_tasks.git_pull.done('Complete');
        }
      } else {
        if (!this.options.quiet) {
          return this.observatory_tasks.git_pull.done('Skipped');
        }
      }
    }).then(function() {
      if (!this.options.quiet) {
        this.observatory_tasks.git_start.status('Starting');
      }
      this.git_commands.start();
      if (!this.options.quiet) {
        return this.observatory_tasks.git_start.done('Complete');
      }
    }).then(function() {
      var err, file, files, i, len;
      try {
        files = globNormalize(this.options.files_to_version);
        for (i = 0, len = files.length; i < len; i++) {
          file = files[i];
          if (!this.options.quiet) {
            this.observatory_tasks.write_files.status(file);
          }
          replaceVersionInFile(file, this.options.current_version, this.options.next_version);
        }
        if (!this.options.quiet) {
          return this.observatory_tasks.write_files.done('Complete');
        }
      } catch (error1) {
        err = error1;
        throw new GitResetError(err);
      }
    }).then(function() {
      if (!this.options.quiet) {
        this.observatory_tasks.write_files.status('package');
      }
      this.package_file.setVersion(this.options.next_version);
      this.package_file.save();
      if (!this.options.quiet) {
        return this.observatory_tasks.write_files.done('Complete');
      }
    }).then(function() {
      var command, err, i, j, len, len1, ref, ref1;
      try {
        if (!this.options.quiet) {
          this.observatory_tasks.pre_commit_commands.status('Running');
        }
        ref = this.options.pre_commit_commands;
        for (i = 0, len = ref.length; i < len; i++) {
          command = ref[i];
          if (!this.options.quiet) {
            this.observatory_tasks.pre_commit_commands.status(command);
          }
          ref1 = this.options.pre_commit_commands;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            command = ref1[j];
            runArbitraryCommand(command);
          }
        }
        if (!this.options.quiet) {
          return this.observatory_tasks.pre_commit_commands.done('Complete');
        }
      } catch (error1) {
        err = error1;
        throw new GitResetError(err);
      }
    }).then(function() {
      var err, files;
      try {
        files = globNormalize(this.options.package_file_location, this.options.files_to_commit, this.options.files_to_version);
        if (!this.options.quiet) {
          this.observatory_tasks.git_commit.status('Committing');
        }
        this.git_commands.commit(files);
        if (!this.options.quiet) {
          return this.observatory_tasks.git_commit.done('Complete');
        }
      } catch (error1) {
        err = error1;
        throw new GitResetError(err);
      }
    }).then(function() {
      var command, err, i, len, ref;
      try {
        if (!this.options.quiet) {
          this.observatory_tasks.post_commit_commands.status('Running');
        }
        ref = this.options.post_commit_commands;
        for (i = 0, len = ref.length; i < len; i++) {
          command = ref[i];
          if (!this.options.quiet) {
            this.observatory_tasks.post_commit_commands.status(command);
          }
          runArbitraryCommand(command);
        }
        if (!this.options.quiet) {
          return this.observatory_tasks.post_commit_commands.done('Complete');
        }
      } catch (error1) {
        err = error1;
        throw new GitResetError(err);
      }
    }).then(function() {
      var err;
      if (!this.options.skip_git_flow_finish) {
        try {
          if (!this.options.quiet) {
            this.observatory_tasks.git_finish.status('Finishing');
          }
          this.git_commands.finish();
          if (!this.options.quiet) {
            return this.observatory_tasks.git_finish.done('Complete');
          }
        } catch (error1) {
          err = error1;
          throw new GitResetError(err);
        }
      } else {
        if (!this.options.quiet) {
          return this.observatory_tasks.git_finish.done('Skipped');
        }
      }
    }).then(function() {
      if (!this.options.skip_git_push) {
        if (!this.options.quiet) {
          this.observatory_tasks.git_push.status('Pushing');
        }
        this.git_commands.push();
        if (!this.options.quiet) {
          return this.observatory_tasks.git_push.done('Complete');
        }
      } else {
        if (!this.options.quiet) {
          return this.observatory_tasks.git_push.done('Skipped');
        }
      }
    }).then(function() {
      var command, error, i, len, ref;
      if (!this.options.quiet) {
        this.observatory_tasks.post_complete_commands.status('Running');
      }
      ref = this.options.post_complete_commands;
      for (i = 0, len = ref.length; i < len; i++) {
        command = ref[i];
        try {
          if (!this.options.quiet) {
            this.observatory_tasks.post_complete_commands.status(command);
          }
          runArbitraryCommand(command);
        } catch (error1) {
          error = error1;
          console.error(error.message);
        }
      }
      if (!this.options.quiet) {
        return this.observatory_tasks.post_complete_commands.done('Complete');
      }
    }).then(function() {
      return process.exit(0);
    })["catch"](GitResetError, function(err) {
      this.git_commands.reset();
      throw err;
    })["catch"](HelpError, function(err) {
      console.log(err.message);
      return process.exit(0);
    })["catch"](function(err) {
      if (IS_DEBUG) {
        throw err;
      }
      console.error(err.message);
      return process.exit(1);
    });
  };

}).call(this);
