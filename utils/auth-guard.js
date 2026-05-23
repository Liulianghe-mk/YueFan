/**
 * 主页面（Tab）访问控制：须已登录且完成资料注册。
 */
var appAuth = require('./app-auth.js');
var userApi = require('./user-api.js');
var apiBase = require('./api-base.js');

var HOME = '/pages/shouye/shouye';
var LOGIN = '/pages/login/login';

function redirectAuth(reason) {
  var url = reason === 'register' ? LOGIN + '?mode=register' : LOGIN;
  wx.reLaunch({ url: url });
}

function checkAccess() {
  if (!appAuth.isLoggedIn()) {
    return Promise.resolve({ allowed: false, reason: 'login' });
  }
  if (!apiBase.getApiBase()) {
    return Promise.resolve({ allowed: true, profile: null });
  }
  return userApi
    .fetchMe()
    .then(function (dto) {
      if (!dto) {
        appAuth.clearStoredToken();
        userApi.clearCachedProfile();
        return { allowed: false, reason: 'login' };
      }
      if (!dto.profileComplete) {
        return { allowed: false, reason: 'register' };
      }
      return { allowed: true, profile: dto };
    })
    .catch(function () {
      appAuth.clearStoredToken();
      userApi.clearCachedProfile();
      return { allowed: false, reason: 'login' };
    });
}

/** 进入 Tab 主页面时调用；未通过则 reLaunch 到登录/注册页 */
function requireMainAccess() {
  return checkAccess().then(function (result) {
    if (!result.allowed) {
      redirectAuth(result.reason);
      return false;
    }
    return true;
  });
}

/** 登录页启动时：已登录且资料完整则直接进入首页 */
function tryEnterHome() {
  return checkAccess().then(function (result) {
    if (result.allowed) {
      wx.reLaunch({ url: HOME });
      return true;
    }
    return false;
  });
}

module.exports = {
  HOME: HOME,
  LOGIN: LOGIN,
  redirectAuth: redirectAuth,
  checkAccess: checkAccess,
  requireMainAccess: requireMainAccess,
  tryEnterHome: tryEnterHome,
};
