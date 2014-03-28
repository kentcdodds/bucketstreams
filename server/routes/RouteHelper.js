var dataModels = require('../model/index').models;


module.exports = {
  /**
   * Looks up the username in req.query and puts the id of the found user into req.query[newName].
   * If the req.query.username does not exist, will simply call the callback.
   * @param req - The request
   * @param newName - The property key to assign the id to
   * @param callback - A callback which should normally behave like a next() function.
   */
  convertUsernameQueryToId: function(req, newName, callback) {
    if (req.query.username) {
      dataModels.user.getByUsername(req.query.username, function(err, user) {
        if (err) {
          return callback({
            code: 500,
            error: err
          });
        }
        if (!user || !user[0]) {
          return callback({
            code: 500,
            error: {
              message: 'No user with username ' + req.query.username
            }
          });
        }
        delete req.query.username;
        req.query[newName || '_id'] = user[0].id;
        callback();
      });
    } else {
      callback();
    }
  },

  /**
   * Adds a route to the app which will change the route url when the prefix/(simpleName)/.* is matched to the string
   * returned by the getReplacement function.
   * @param app - The app to add the route to
   * @param prefix - The prefix that will remain unchanged.
   * @param simpleName - The item to be replaced in the url.
   * @param getReplacement - A function which accepts a request and returns a string
   *   which will replace the simpleName
   */
  addConversionRoute: function(app, prefix, simpleName, getReplacement) {
    var regexRoute = new RegExp('^(' + prefix.replace(/\//g, '\\/') + '\\/)(' + simpleName + ')(.*)');
    app.all(regexRoute, function(req, res, next) {
      var replacement = getReplacement(req);
      if (!replacement) {
        res.json(404);
      } else {
        req.url = req.url.replace(regexRoute, '$1' + replacement + '$3');
        next();
      }
    });
  }

};
