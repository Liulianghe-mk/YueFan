/**
 * 关注 /api/app/follows，与「结识的好友」、个人主页「关注」按钮同一数据源。
 */
var meetupsApi = require('./meetups-api.js');
var appAuth = require('./app-auth.js');

var STORAGE_KEY = 'yuefan_followed_ids';

function request(method, path, data) {
  var base = meetupsApi.getApiBase();
  if (!base) return Promise.resolve(null);
  var url = base.replace(/\/$/, '') + path;
  if (data && data.following !== undefined) {
    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'following=' + (data.following ? 'true' : 'false');
  }
  return appAuth.ensureAppAccessToken().then(function (token) {
    return new Promise(function (resolve, reject) {
      wx.request({
        url: url,
        method: method,
        header: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
          'X-Miniapp-User': 'miniapp-user',
        },
        data: data ? JSON.stringify(data) : '',
        success: function (res) {
          var body = res.data;
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error((body && body.message) || 'HTTP ' + res.statusCode));
            return;
          }
          if (!body || body.code !== 0) {
            reject(new Error((body && body.message) || '接口异常'));
            return;
          }
          resolve(body.data);
        },
        fail: function (err) {
          reject(err && err.errMsg ? new Error(err.errMsg) : new Error('网络失败'));
        },
      });
    });
  });
}

function readLocalIds() {
  try {
    var raw = wx.getStorageSync(STORAGE_KEY);
    if (raw && Array.isArray(raw)) return raw.map(Number).filter(function (n) { return !isNaN(n) && n > 0; });
  } catch (e) {}
  return [];
}

function writeLocalIds(ids) {
  try {
    wx.setStorageSync(STORAGE_KEY, ids);
  } catch (e) {}
}

function fetchFollowedInfluencerIds() {
  return request('GET', '/api/app/follows/influencer-ids').then(function (list) {
    if (list == null) return readLocalIds();
    var ids = list.map(Number);
    writeLocalIds(ids);
    return ids;
  });
}

function fetchFollowing() {
  return request('GET', '/api/app/follows/following').then(function (list) {
    if (list == null) return [];
    return list;
  });
}

function setFollow(influencerId, following) {
  var id = Number(influencerId);
  if (isNaN(id) || id <= 0) return Promise.reject(new Error('无效用户'));
  var base = meetupsApi.getApiBase();
  if (!base) {
    var ids = readLocalIds();
    if (following) {
      if (ids.indexOf(id) < 0) ids.unshift(id);
    } else {
      ids = ids.filter(function (x) { return x !== id; });
    }
    writeLocalIds(ids);
    return Promise.resolve({ influencerId: id, following: !!following, followersCount: 0 });
  }
  return request('PUT', '/api/app/follows/' + encodeURIComponent(String(id)), { following: !!following }).then(
    function (state) {
      var ids = readLocalIds();
      if (following) {
        if (ids.indexOf(id) < 0) ids.unshift(id);
      } else {
        ids = ids.filter(function (x) { return x !== id; });
      }
      writeLocalIds(ids);
      return state;
    },
  );
}

function isFollowedLocal(influencerId) {
  return readLocalIds().indexOf(Number(influencerId)) >= 0;
}

/** 将 followed 标记合并到带 authorProfileId / id 的列表项 */
function applyFollowedToPosts(posts, followedIds) {
  var set = {};
  (followedIds || []).forEach(function (id) {
    set[id] = true;
  });
  return (posts || []).map(function (p) {
    var pid = p.authorProfileId != null ? p.authorProfileId : p.id;
    return Object.assign({}, p, { followed: !!set[Number(pid)] });
  });
}

module.exports = {
  getApiBase: meetupsApi.getApiBase,
  fetchFollowedInfluencerIds: fetchFollowedInfluencerIds,
  fetchFollowing: fetchFollowing,
  setFollow: setFollow,
  isFollowedLocal: isFollowedLocal,
  applyFollowedToPosts: applyFollowedToPosts,
  readLocalIds: readLocalIds,
};
