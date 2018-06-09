const moment = require('moment');

const generateMessage = (from, text) => ({
    from,
    text,
    createdAt: moment().valueOf(),
  });

module.exports = { generateMessage };
