var fs = require('fs');
var _ = require('lodash-node');
var glob = require('glob');

module.exports = (function() {

  function getFilesInPath(pattern, removePrefix) {
    var files = glob.sync(pattern);
    _.each(files, function(file, num) {
      files[num] = file.substring(removePrefix.length);
    });
    return files;
  }

  var customStyles = getFilesInPath('./public/styles/*.css', './public');
  var thirdPartyStyles = [
    '/bower_components/bootstrap/dist/css/bootstrap.min.css',
    '/non_bower_components/font-awesome-4.0.3/css/font-awesome.min.css',
    '/bower_components/toastr/toastr.min.css'
  ];

  function getSection(root, name) {
    var appJs = getFilesInPath(root + name + '/app.js', root);
    var otherJsFiles = getFilesInPath(root + name + '/**/*.js', root);
    return _.union(appJs, otherJsFiles);
  }

  function getBSJSCommon() {
    var root = './public';
    var path = '/bower_components/bs-js-common/bs.common.';
    var models = getSection(root, path + 'models');
    var services = getSection(root, path + 'services');
    var filters = getSection(root, path + 'filters');
    var directives = getSection(root, path + 'directives');
    return _.union(['/bower_components/bs-js-common/app.js'], models, services, filters, directives);
  }

  function getAppSection(name) {
    return getSection('./public', '/' + name);
  }

  var commonConfig = {
    stylesheets: _.union(thirdPartyStyles, customStyles),
    topScripts: [
      '/bower_components/ng-file-upload/angular-file-upload-shim.js',
      '/bower_components/angular/angular.js',
      '/scripts/facebook-fix.js'
    ],
    scripts: _.union([
      '/bower_components/jquery/dist/jquery.js',
      '/bower_components/lodash/dist/lodash.js',
      '/bower_components/toastr/toastr.js',
      '/bower_components/momentjs/moment.js',
      '/bower_components/ng-file-upload/angular-file-upload.js',
      '/bower_components/angular-ui-router/release/angular-ui-router.js',
      '/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      '/bower_components/angular-animate/angular-animate.js',
      '/bower_components/angular-resource/angular-resource.js',
      '/bower_components/angular-cookies/angular-cookies.js',
      '/bower_components/angular-sanitize/angular-sanitize.js',
      '/bower_components/genie/genie.js',
      '/bower_components/ux-genie/uxGenie.js',
      '/bower_components/firebase/firebase.js',
      '/bower_components/angularfire/angularfire.js'
    ], getBSJSCommon(), getAppSection('constants'), getAppSection('components'))
  };

  var frontPageScripts = getAppSection('front-page');
  var mainScripts = getAppSection('main');

  var isDev = /development|local/.test(process.env.NODE_ENV);

  return {
    frontPage: {
      name: 'front-page',
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.frontPage',
      scripts: _.union(commonConfig.scripts, frontPageScripts),
      isDev: isDev
    },
    main: {
      name: 'main',
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.web.app',
      scripts: _.union(commonConfig.scripts, mainScripts),
      isDev: isDev
    }
  };
})();