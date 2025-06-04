module.exports = (app) => {
  app.use('/api/user', require('./user'));
};
