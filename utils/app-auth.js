/**
 * 小程序端 App JWT：账号密码登录 / 注册，开发环境仍支持 code=dev。
 */
var apiBase = require('./api-base.js');

var STORAGE_KEY = 'yuefan_app_access_token';

function getStoredToken() {
  try {
    var t = wx.getStorageSync(STORAGE_KEY);
    return typeof t === 'string' && t.trim() ? t.trim() : '';
  } catch (e) {
    return '';
  }
}

function setStoredToken(token) {
  try {
    if (token && String(token).trim()) {
      wx.setStorageSync(STORAGE_KEY, String(token).trim());
    }
  } catch (e) {}
}

function parseApiBody(data) {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return data;
}

function apiErrorMessage(res, fallback) {
  var body = parseApiBody(res.data);
  if (body && body.message) {
    return String(body.message);
  }
  if (res.statusCode === 401) {
    if (body && body.message && String(body.message).indexOf('未登录或令牌') >= 0) {
      return '后端未放行登录/注册接口，请在本机重启 backend（mvn spring-boot:run）后重试';
    }
    return '用户名或密码错误';
  }
  if (res.statusCode === 404) {
    return '接口不存在，请重启并更新后端';
  }
  return fallback || 'HTTP ' + res.statusCode;
}

function parseTokenResponse(res, reject) {
  if (res.statusCode < 200 || res.statusCode >= 300) {
    reject(new Error(apiErrorMessage(res, '请求失败')));
    return null;
  }
  var body = parseApiBody(res.data);
  if (!body || body.code !== 0 || !body.data || !body.data.accessToken) {
    reject(new Error((body && body.message) || '请求失败'));
    return null;
  }
  return String(body.data.accessToken).trim();
}

function postJson(path, data) {
  var base = apiBase.getApiBase();
  if (!base) {
    return Promise.reject(new Error('未配置 apiBase'));
  }
  return new Promise(function (resolve, reject) {
    wx.request({
      url: base.replace(/\/$/, '') + path,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: function (res) {
        var token = parseTokenResponse(res, reject);
        if (token) resolve(token);
      },
      fail: function (err) {
        reject(err && err.errMsg ? new Error(err.errMsg) : new Error('网络请求失败'));
      },
    });
  });
}

function postAppLogin(code) {
  var bodyCode = (code && String(code).trim()) || 'dev';
  return postJson('/api/app/auth/login', { code: bodyCode });
}

function loginWithAccount(username, password) {
  return postJson('/api/app/auth/login-account', {
    username: (username && String(username).trim()) || '',
    password: password == null ? '' : String(password),
  }).then(function (token) {
    setStoredToken(token);
    return token;
  });
}

function registerAccount(payload) {
  return postJson('/api/app/auth/register', payload || {}).then(function (token) {
    setStoredToken(token);
    return token;
  });
}

/**
 * 获取已存储的 token，未登录则拒绝。
 * @returns {Promise<string>}
 */
function ensureAppAccessToken() {
  var existing = getStoredToken();
  if (existing) {
    return Promise.resolve(existing);
  }
  return Promise.reject(new Error('请先登录'));
}

function clearStoredToken() {
  try {
    wx.removeStorageSync(STORAGE_KEY);
  } catch (e) {}
}

function isLoggedIn() {
  return !!getStoredToken();
}

function loginWithCode(code) {
  return postAppLogin(code).then(function (token) {
    setStoredToken(token);
    return token;
  });
}

function logout() {
  clearStoredToken();
  try {
    var userApi = require('./user-api.js');
    userApi.clearCachedProfile();
  } catch (e) {}
}

module.exports = {
  STORAGE_KEY: STORAGE_KEY,
  getStoredToken: getStoredToken,
  setStoredToken: setStoredToken,
  clearStoredToken: clearStoredToken,
  isLoggedIn: isLoggedIn,
  loginWithCode: loginWithCode,
  loginWithAccount: loginWithAccount,
  registerAccount: registerAccount,
  logout: logout,
  ensureAppAccessToken: ensureAppAccessToken,
};

