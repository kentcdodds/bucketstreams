var logger = require('winston');
var async = require('async');

require('./config/local')();
require('./config/database')();
var User = require('./model/User').model;

function onTick() {
  var start = new Date().getTime();
  var errors = [];
  var totalPosts = 0;

  User.find({}, function(err, users) {
    async.every(users, function(user, done) {
      user.importPosts(function(err, user, importedPosts) {
        if (err) {
          errors.push(err);
        } else {
          totalPosts += importedPosts.length;
        }
        done(!err);
      });
    }, function(allUsersImported) {
      if (!allUsersImported) {
        logger.error(['All users not imported! Total errors:', errors.length, JSON.stringify(errors)].join(' '));
      }
      var end = new Date().getTime();
      logger.info('Successfully imported ' +
        totalPosts + ' posts for ' + users.length +
        ' user' + (users.length === 1 ? '' : 's') +
        ' in ' + ((end - start) / 1000) + ' seconds.');
    });
  });
}

var cronJob = require('cron').CronJob;
var job = new cronJob({
  cronTime: '0/5 * * * * *',
  onTick: onTick
});
logger.info('Starting job...');
job.start();