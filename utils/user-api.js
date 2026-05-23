var apiBase = require('./api-base.js');
var appAuth = require('./app-auth.js');

var PROFILE_KEY = 'yuefan_user_profile';

var DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80';

/** 保证 image/cover-image 的 src 始终为合法非空字符串（glass-easel 对类型校验更严） */
function normalizeImageSrc(src, fallback) {
  return resolveAvatarUrl(src, fallback);
}

/**
 * 供 <image src> 使用：glass-easel 要求非空 string，且不接受 http://usr 等仅用于上传的临时地址。
 */
function resolveAvatarUrl(url, fallback) {
  var fb = fallback || DEFAULT_AVATAR;
  if (url == null || typeof url !== 'string') return fb;
  var t = url.trim();
  if (!t) return fb;
  if (t.indexOf('wxfile://') === 0) return t;
  if (t.indexOf('cloud://') === 0) return t;
  if (t.indexOf('http://tmp') === 0 || t.indexOf('https://tmp') === 0) return t;
  if (/^https?:\/\/(127\.0\.0\.1|localhost):\d+\/.*__tmp__\//.test(t)) return t;
  if (t.indexOf('http://usr/') === 0 || t.indexOf('https://usr/') === 0) return fb;
  if (t.indexOf('https://') === 0) return t;
  if (t.indexOf('http://') === 0) return t;
  if (t.indexOf('/') === 0) {
    var base = apiBase.getApiBase();
    if (base) return base.replace(/\/$/, '') + t;
    return t;
  }
  return fb;
}

/** 已是后端持久化的头像 URL，无需再 upload */
function isPersistedAvatarUrl(path) {
  var p = (path || '').trim();
  if (!p) return false;
  if (p.indexOf('/uploads/avatars/') >= 0) return true;
  var base = apiBase.getApiBase();
  if (base) {
    var prefix = base.replace(/\/$/, '') + '/uploads/avatars/';
    if (p.indexOf(prefix) === 0) return true;
  }
  return false;
}

/** 微信临时文件路径（须先 wx.uploadFile，不能 PUT 临时 URL） */
function isLocalTempAvatar(path) {
  if (!path || typeof path !== 'string') return false;
  var p = path.trim();
  if (!p || isPersistedAvatarUrl(p)) return false;
  if (p.indexOf('wxfile://') === 0) return true;
  if (p.indexOf('http://tmp') === 0 || p.indexOf('https://tmp') === 0) return true;
  if (p.indexOf('http://usr/') === 0 || p.indexOf('https://usr/') === 0) return true;
  if (/^https?:\/\/127\.0\.0\.1:\d+\/.*__tmp__\//.test(p)) return true;
  if (/^https?:\/\/localhost:\d+\/.*__tmp__\//.test(p)) return true;
  if (p.indexOf('http://') !== 0 && p.indexOf('https://') !== 0) return true;
  return false;
}

function cacheProfile(profile) {
  try {
    if (profile) wx.setStorageSync(PROFILE_KEY, profile);
  } catch (e) {}
}

function getCachedProfile() {
  try {
    return wx.getStorageSync(PROFILE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function clearCachedProfile() {
  try {
    wx.removeStorageSync(PROFILE_KEY);
  } catch (e) {}
}

function mapMeToWodeUser(dto) {
  if (!dto) return null;
  var avatar = normalizeImageSrc(dto.avatarUrl);
  return {
    avatar: avatar,
    name: (dto.nickname && String(dto.nickname).trim()) || '未登录',
    levelText: (dto.levelText && String(dto.levelText).trim()) || 'LV.1',
    bio: (dto.bio && String(dto.bio).trim()) || '完善资料，让更多饭友认识你',
    profileComplete: !!dto.profileComplete,
    openid: dto.openid || '',
  };
}

function requestMe(method, data) {
  var base = apiBase.getApiBase();
  if (!base) {
    return Promise.resolve(null);
  }
  return appAuth.ensureAppAccessToken().then(function (token) {
    return new Promise(function (resolve, reject) {
      wx.request({
        url: base.replace(/\/$/, '') + '/api/app/me',
        method: method,
        header: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        data: data,
        success: function (res) {
          if (res.statusCode === 401) {
            appAuth.clearStoredToken();
            reject(new Error('登录已过期，请重新登录'));
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error((res.data && res.data.message) || 'HTTP ' + res.statusCode));
            return;
          }
          var body = res.data;
          if (!body || body.code !== 0) {
            reject(new Error((body && body.message) || '请求失败'));
            return;
          }
          resolve(body.data);
        },
        fail: function (err) {
          reject(err && err.errMsg ? new Error(err.errMsg) : new Error('网络请求失败'));
        },
      });
    });
  });
}

function fetchMe() {
  return requestMe('GET').then(function (dto) {
    cacheProfile(dto);
    return dto;
  });
}

function updateMe(payload) {
  return requestMe('PUT', payload).then(function (dto) {
    cacheProfile(dto);
    return dto;
  });
}

function uploadAvatarFile(localPath) {
  var base = apiBase.getApiBase();
  if (!base) {
    return Promise.reject(new Error('未配置 apiBase'));
  }
  if (!localPath || !isLocalTempAvatar(localPath)) {
    return Promise.reject(new Error('无效的头像文件'));
  }
  return appAuth.ensureAppAccessToken().then(function (token) {
    return new Promise(function (resolve, reject) {
      wx.uploadFile({
        url: base.replace(/\/$/, '') + '/api/app/me/avatar',
        filePath: localPath,
        name: 'file',
        header: {
          Authorization: 'Bearer ' + token,
        },
        success: function (res) {
          if (res.statusCode === 401) {
            appAuth.clearStoredToken();
            reject(new Error('登录已过期，请重新登录'));
            return;
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            var errMsg = '上传失败';
            try {
              var errBody = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
              if (errBody && errBody.message) errMsg = String(errBody.message);
            } catch (e) {}
            reject(new Error(errMsg));
            return;
          }
          var body;
          try {
            body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          } catch (e) {
            reject(new Error('上传响应解析失败'));
            return;
          }
          if (!body || body.code !== 0 || !body.data) {
            reject(new Error((body && body.message) || '上传失败'));
            return;
          }
          cacheProfile(body.data);
          resolve(body.data);
        },
        fail: function (err) {
          reject(err && err.errMsg ? new Error(err.errMsg) : new Error('上传失败'));
        },
      });
    });
  });
}

/**
 * 保存资料：本地临时头像先上传，再 PUT /api/app/me。
 */
function updateMeWithAvatar(payload) {
  var avatar = payload && payload.avatarUrl;
  if (isLocalTempAvatar(avatar)) {
    return uploadAvatarFile(avatar).then(function (dto) {
      return updateMe({
        nickname: payload.nickname,
        avatarUrl: dto.avatarUrl || '',
        bio: payload.bio,
      });
    });
  }
  var url = avatar == null ? '' : String(avatar).trim();
  if (isLocalTempAvatar(url)) {
    url = '';
  }
  return updateMe({
    nickname: payload.nickname,
    avatarUrl: url,
    bio: payload.bio,
  });
}

module.exports = {
  PROFILE_KEY: PROFILE_KEY,
  DEFAULT_AVATAR: DEFAULT_AVATAR,
  normalizeImageSrc: normalizeImageSrc,
  resolveAvatarUrl: resolveAvatarUrl,
  isPersistedAvatarUrl: isPersistedAvatarUrl,
  isLocalTempAvatar: isLocalTempAvatar,
  getCachedProfile: getCachedProfile,
  clearCachedProfile: clearCachedProfile,
  mapMeToWodeUser: mapMeToWodeUser,
  fetchMe: fetchMe,
  updateMe: updateMe,
  uploadAvatarFile: uploadAvatarFile,
  updateMeWithAvatar: updateMeWithAvatar,
};
