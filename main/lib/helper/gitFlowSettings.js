// Generated by CoffeeScript 1.12.7

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var BRANCH_CONFIG, FS, IniParser, PREFIX_CONFIG;

  FS = require('fs');

  IniParser = require('iniparser');

  BRANCH_CONFIG = 'gitflow "branch"';

  PREFIX_CONFIG = 'gitflow "prefix"';

  module.exports = function(project_path) {
    var file, ini_data;
    file = project_path + "/.git/config";
    if (!FS.existsSync(file)) {
      throw new Error("Git Config File is missing: " + file);
    }
    ini_data = IniParser.parseSync(file);
    if (ini_data == null) {
      throw new Error('Failed to parse ini file');
    }
    if (!((ini_data[BRANCH_CONFIG] != null) && (ini_data[BRANCH_CONFIG]['master'] != null) && (ini_data[BRANCH_CONFIG]['develop'] != null))) {
      throw new Error('Git config missing git-flow branch configuration');
    }
    if (!((ini_data[PREFIX_CONFIG] != null) && (ini_data[PREFIX_CONFIG]['versiontag'] != null))) {
      throw new Error('Git config missing git-flow prefix configuration');
    }
    return {
      master: ini_data[BRANCH_CONFIG]['master'],
      develop: ini_data[BRANCH_CONFIG]['develop']
    };
  };

}).call(this);
