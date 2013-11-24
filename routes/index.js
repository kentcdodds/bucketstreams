module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./AuthenticationRoutes')(app);
};
