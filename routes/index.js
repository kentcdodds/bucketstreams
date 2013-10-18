module.exports = function(app) {
  app.get('/api/*', function(req, res, next) {
    res.json({api: 'hit'});
  });
  app.get('*', function(req, res, next) {
    res.render('index',{});
  });
};
