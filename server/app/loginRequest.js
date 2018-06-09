const moment = require('moment');

const LoginRequest = (from, username) => ({
  from,
  username,
  createdAt: moment().valueOf(),
});

module.exports = { LoginRequest };
