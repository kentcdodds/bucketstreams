module.exports = function(app) {

  app.get('/import', function(req, res, next) {
    if (req.user) {
      req.user.importPosts(function() {
        res.json({complete: 'yes'});
      });
    }
  });

};
