var localConfig = require('../local/config');
module.exports = function() {
  if (localConfig) {
    localConfig();
  }
}