module.exports = function(app) {
  require('./AngularRoutes')(app);
  require('./AuthenticationRoutes')(app);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
    require('../local/HelperRoutes')(app);
  }

  app.get('/views/:name', function(req, res) {
    var name = req.params.name;
    res.sendfile(app.get('directory') + '/app/views/' + name);
  });

  // catch all. MUST BE ADDED LAST!
  app.get('*', function(req, res) {
    console.log('catchall');
    res.sendfile(app.get('directory') + '/app/index.html');
  });
};
