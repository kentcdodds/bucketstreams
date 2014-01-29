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
    return _.union(getFilesInPath('./app/' + name + '/app.js', './app'), getFilesInPath('./app/' + name + '/**/*.js', './app'));
  }

  var anonymousScripts = getAppSection('anonymous');
  var authenticatedScripts = getAppSection('authenticated');
  var componentWrapperScripts = getAppSection('componentWrapper');
  var componentScripts = getAppSection('components');

  return {
    anonymous: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.anonymous',
      scripts: commonConfig.scripts.concat(anonymousScripts.concat(componentScripts))
    },
    authenticated: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.app',
      scripts: commonConfig.scripts.concat(authenticatedScripts.concat(componentScripts))
    },
    components: {
      stylesheets: commonConfig.stylesheets,
      topScripts: commonConfig.topScripts,
      appName: 'bs.componentWrapper',
      scripts: commonConfig.scripts.concat(componentWrapperScripts.concat(componentScripts))
    }
  };
})();