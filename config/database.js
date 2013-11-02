module.exports = function() {
  if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    process.env.MONGO_CONNECTION_STRING = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
      process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
      process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
      process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
      process.env.OPENSHIFT_APP_NAME;
  }
  require('../model');
};
