var config = require('./config.js');

function getApiBase() {
  var b = config.apiBase;
  return typeof b === 'string' ? b.trim().replace(/\/$/, '') : '';
}

module.exports = {
  getApiBase: getApiBase,
};
