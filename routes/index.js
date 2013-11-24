module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./TempRoutes')(app);
  require('./AuthenticationRoutes')(app);
};
