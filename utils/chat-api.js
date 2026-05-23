/**
 * 私信与后端 /api/app/chat 同步（与 admin-web「私信会话」同一数据源）。
 */
var meetupsApi = require('./meetups-api.js');

function request(method, path, data) {
  var base = meetupsApi.getApiBase();
  if (!base) return Promise.resolve(null);
  return new Promise(function (resolve, reject) {
    wx.request({
      url: base.replace(/\/$/, '') + path,
      method: method,
      header: { 'Content-Type': 'application/json' },
      data: data,
      success: function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error('HTTP ' + res.statusCode));
          return;
        }
        var body = res.data;
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
}

function mapConv(dto) {
  return {
    id: String(dto.id),
    peerId: dto.peerId || '',
    peerName: dto.peerName || '',
    peerAvatar: dto.peerAvatarUrl || '',
    contextLabel: dto.contextLabel || '',
    lastMessage: dto.lastMessage || '',
    lastTime: dto.lastTime || '',
    unread: dto.unreadForUser || 0,
    _serverId: dto.id,
  };
}

function mapMsg(dto) {
  return {
    id: String(dto.id),
    from: dto.from === 'me' ? 'me' : 'peer',
    type: 'text',
    content: dto.content || '',
    time: dto.time || '',
    ts: dto.id,
  };
}

function fetchConversations() {
  return request('GET', '/api/app/chat/conversations').then(function (list) {
    if (!list) return null;
    return list.map(mapConv);
  });
}

function ensureConversation(peer) {
  return request('POST', '/api/app/chat/conversations', {
    peerId: peer.peerId != null ? String(peer.peerId) : '',
    peerName: peer.peerName || '',
    peerAvatarUrl: peer.peerAvatar || '',
    contextLabel: peer.contextLabel || '',
    greeting: peer.greeting || '',
  }).then(function (dto) {
    return mapConv(dto);
  });
}

function fetchMessages(serverConvId) {
  return request('GET', '/api/app/chat/conversations/' + encodeURIComponent(String(serverConvId)) + '/messages').then(
    function (list) {
      if (!list) return [];
      return list.map(mapMsg);
    },
  );
}

function sendMessage(serverConvId, content) {
  return request(
    'POST',
    '/api/app/chat/conversations/' + encodeURIComponent(String(serverConvId)) + '/messages',
    { content: content },
  ).then(function (dto) {
    return mapMsg(dto);
  });
}

module.exports = {
  getApiBase: meetupsApi.getApiBase,
  fetchConversations: fetchConversations,
  ensureConversation: ensureConversation,
  fetchMessages: fetchMessages,
  sendMessage: sendMessage,
};
