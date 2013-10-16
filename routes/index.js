module.exports = function(app) {
  app.get('/api/*', function(req, res, next) {
    console.log('hitting api');
    res.json({api: 'hit'});
  });
  app.get('*', function(req, res, next) {
    res.render('index',{});
  });
};
