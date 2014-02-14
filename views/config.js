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

  var customStyles = getFilesInPath('./app/styles/*.css', './app');
  var thirdPartyStyles = [
    '/bower_components/bootstrap/dist/css/bootstrap.min.css',
    '/non_bower_components/font-awesome-4.0.3/css/font-awesome.min.css',
    '/bower_components/toastr/toastr.min.css'
  ];

  var commonConfig = {
    stylesheets: _.union(thirdPartyStyles, customStyles),
    topScripts: [
      '/bower_components/angular/angular.js',
      '/scripts/facebook-fix.js'
    ],
    scripts: _.union([
      '/bower_components/jquery/jquery.js',
      '/bower_components/lodash/dist/lodash.js',
      '/bower_components/toastr/toastr.js',
      '/bower_components/momentjs/moment.js',
      '/bower_components/angular-ui-router/release/angular-ui-router.js',
      '/non_bower_components/ui-bootstrap-tpls-0.9.0.js',
      '/bower_components/angular-animate/angular-animate.js',
      '/bower_components/angular-resource/angular-resource.js',
      '/bower_components/angular-cookies/angular-cookies.js',
      '/bower_components/angular-sanitize/angular-sanitize.js',
      '/bower_components/angular-bindonce/bindonce.js'
    ], getAppSection('constants'))
  };

  function getAppSection(name) {
    var appJs = getFilesInPath('./app/' + name + '/app.js', './app');
    var otherJsFiles = getFilesInPath('./app/' + name + '/**/*.js', './app');
    return _.union(appJs, otherJsFiles);
  }

  var frontPageScripts = getAppSection('front-page');
  var mainScripts = getAppSection('main');
  var componentWrapperScripts = getAppSection('componentWrapper');
  var componentScripts = getAppSection('components');
  var modelScripts = getAppSection('models');

  var isDev = process.env.NODE_ENV === 'development';

  return {
    frontPage: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.frontPage',
      scripts: _.union(commonConfig.scripts, frontPageScripts, componentScripts, modelScripts),
      isDev: isDev
    },
    main: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.app',
      scripts: _.union(commonConfig.scripts, mainScripts, componentScripts, modelScripts),
      isDev: isDev
    },
    components: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.componentWrapper',
      scripts: _.union(commonConfig.scripts, componentWrapperScripts, componentScripts, modelScripts),
      isDev: isDev
    }
  };
})();