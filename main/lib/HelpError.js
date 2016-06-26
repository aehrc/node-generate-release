// Generated by CoffeeScript 1.10.0

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var HelpError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  HelpError = (function(superClass) {
    extend(HelpError, superClass);

    function HelpError(post) {
      this.message = "generate-release\n\n-r, --readme               Path to README.md file. Default: ./README.md\n-p, --package              Path to package.json file. Default: ./package.json\n-c, --current-version      Current Version. Default: read from package.json\n-t, --release-type         Release Type: patch, minor, major. Default: prompt\n-n, --no-confirm           Do not ask for confirmation. Default: prompt for confirmation\n-l, --skip-git-pull        Do not pull from origin and rebase master and dev. Default: Do pull\n-s, --skip-git-push        Do not push to origin when complete. Default: Do push\n-d, --release-file         Path to your .release.json file. Default: ./.release.json\n-m, --set-release-message  Prompt to write a release message. Default: Release {version}\n-o, --remote               Change the remote. Default: origin\n\n" + (post || '');
    }

    return HelpError;

  })(Error);

  module.exports = HelpError;

}).call(this);
