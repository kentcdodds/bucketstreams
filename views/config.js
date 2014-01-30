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
    '/non_bower_components/font-awesome-4.0.3/css/font-awesome.min.css'
  ];

  var commonConfig = {
    stylesheets: thirdPartyStyles.concat(customStyles),
    topScripts: [
      '/bower_components/angular/angular.js',
      '/scripts/facebook-fix.js'
    ],
    scripts: [
      '/bower_components/angular-ui-router/release/angular-ui-router.js',
      '/non_bower_components/ui-bootstrap-tpls-0.9.0.js',
      '/bower_components/angular-animate/angular-animate.js',
      '/bower_components/angular-resource/angular-resource.js',
      '/bower_components/angular-cookies/angular-cookies.js',
      '/bower_components/angular-sanitize/angular-sanitize.js',
      '/bower_components/angular-bindonce/bindonce.js'
    ]
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

  return {
    frontPage: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.frontPage',
      scripts: commonConfig.scripts.concat(frontPageScripts.concat(componentScripts))
    },
    main: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.app',
      scripts: commonConfig.scripts.concat(mainScripts.concat(componentScripts))
    },
    components: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.componentWrapper',
      scripts: commonConfig.scripts.concat(componentWrapperScripts.concat(componentScripts))
    }
  };
})();