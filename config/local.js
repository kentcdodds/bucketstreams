var logger = require('winston');
module.exports = function() {
  logger.info(process.env.NODE_ENV + ' <-- Node env');
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
    process.env.NODE_ENV = 'local';
    logger.info('Must be local!');
    require('../local/config')();
  }
}