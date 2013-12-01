var config = {
  local: require('./local'),
  database: require('./database'),
  passport: require('./passport'),
  express: require('./express'),
  routes: require('../routes'),
  configAll: function(app) {
    this.local();
    this.database();
    this.passport();
    this.express(app);
    this.routes(app);
  }
};
module.exports = config;