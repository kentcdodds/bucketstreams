module.exports = function() {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local' || process.env.LOCAL) {
    require('../local/config')();
  }
};