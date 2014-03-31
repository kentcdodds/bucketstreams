module.exports = function(app) {
  require('./local')();
  require('./database')();
  require('./passport')();
  require('./express')(app);
  require('../routes')(app);
};