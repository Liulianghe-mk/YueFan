/**
 * 当前小程序用户 openid：优先从 App JWT 的 sub 解析，否则回退开发占位。
 */
var appAuth = require('./app-auth.js');

var DEFAULT_OPENID = 'miniapp-user';

function decodeJwtSub(token) {
  if (!token || typeof token !== 'string') return '';
  var parts = token.split('.');
  if (parts.length < 2) return '';
  try {
    var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    var json = JSON.parse(decodeURIComponent(escape(atob(payload))));
    if (json && json.sub) return String(json.sub).trim();
  } catch (e) {
    return '';
  }
  return '';
}

function getOpenid() {
  var sub = decodeJwtSub(appAuth.getStoredToken());
  return sub || DEFAULT_OPENID;
}

module.exports = {
  DEFAULT_OPENID: DEFAULT_OPENID,
  getOpenid: getOpenid,
};
