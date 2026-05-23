var config = require('./config.js');
var miniappUser = require('./miniapp-user.js');
var appAuth = require('./app-auth.js');

function getApiBase() {
  var b = config.apiBase;
  return typeof b === 'string' ? b.trim().replace(/\/$/, '') : '';
}

function appHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Miniapp-User': miniappUser.getOpenid(),
  };
}

function requestWithUser(method, path, data) {
  var base = getApiBase();
  if (!base) return Promise.resolve(null);
  return appAuth.ensureAppAccessToken().then(function (token) {
    var headers = appHeaders();
    if (token) headers.Authorization = 'Bearer ' + token;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: base + path,
        method: method,
        header: headers,
        data: data,
        success: function (res) {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error((res.data && res.data.message) || 'HTTP ' + res.statusCode));
            return;
          }
          var body = res.data;
          if (!body || body.code !== 0) {
            reject(new Error((body && body.message) || '接口返回异常'));
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

function mapCommentToUi(dto) {
  var replies = (dto.replies || []).map(function (r) {
    var prefix = r.replyToNickname ? '回复 @' + r.replyToNickname + '：' : '';
    return {
      id: r.id,
      authorName: r.authorName || '',
      authorAvatar: r.authorAvatarUrl || '',
      timeText: r.timeText || '',
      content: prefix + (r.content || ''),
      parentId: r.parentId,
      replyToNickname: r.replyToNickname || '',
    };
  });
  return {
    id: dto.id,
    authorName: dto.authorName || '',
    authorAvatar: dto.authorAvatarUrl || '',
    timeText: dto.timeText || '',
    content: dto.content || '',
    parentId: dto.parentId,
    replyToNickname: dto.replyToNickname || '',
    replies: replies,
  };
}

function fetchComments(postId) {
  return requestWithUser('GET', '/api/app/feed/posts/' + encodeURIComponent(String(postId)) + '/comments').then(
    function (list) {
      if (!list || !list.length) return [];
      return list.map(mapCommentToUi);
    },
  );
}

function likePost(postId) {
  return requestWithUser('POST', '/api/app/feed/posts/' + encodeURIComponent(String(postId)) + '/like');
}

function unlikePost(postId) {
  return requestWithUser('DELETE', '/api/app/feed/posts/' + encodeURIComponent(String(postId)) + '/like');
}

function addComment(postId, content, parentId) {
  var body = { content: content };
  if (parentId != null) body.parentId = parentId;
  return requestWithUser(
    'POST',
    '/api/app/feed/posts/' + encodeURIComponent(String(postId)) + '/comments',
    body,
  );
}

module.exports = {
  fetchComments: fetchComments,
  likePost: likePost,
  unlikePost: unlikePost,
  addComment: addComment,
  mapCommentToUi: mapCommentToUi,
};
