var chatStore = require('./chat-store.js');
var chatApi = require('./chat-api.js');

function navigateToChat(conv) {
  var q = [
    'convId=' + encodeURIComponent(conv.id),
    'peerId=' + encodeURIComponent(conv.peerId || ''),
    'peerName=' + encodeURIComponent(conv.peerName || ''),
    'peerAvatar=' + encodeURIComponent(conv.peerAvatar || ''),
  ];
  if (conv.contextLabel) {
    q.push('context=' + encodeURIComponent(conv.contextLabel));
  }
  if (conv._serverId != null) {
    q.push('serverId=' + encodeURIComponent(String(conv._serverId)));
  }
  wx.navigateTo({ url: '/pages/sixin-chat/sixin-chat?' + q.join('&') });
}

/**
 * 打开与某人的私信对话（不存在则创建会话）。
 */
function isConnectionRefused(err) {
  var msg = (err && err.message) || '';
  return /ERR_CONNECTION_REFUSED|connection refused|连接失败|request:fail/i.test(msg);
}

function openChat(peer) {
  if (chatApi.getApiBase()) {
    chatApi
      .ensureConversation(peer)
      .then(function (conv) {
        navigateToChat(conv);
      })
      .catch(function (err) {
        if (isConnectionRefused(err)) {
          wx.showModal({
            title: '无法连接后端',
            content:
              '真机不能使用 127.0.0.1。请在 utils/config.js 将 USE_LAN_FOR_PHONE 设为 true，并把 apiBaseLan 改成你电脑的局域网 IP（与手机同一 WiFi），且确保 backend 已启动。',
            showCancel: true,
            cancelText: '本地演示',
            confirmText: '知道了',
            success: function (res) {
              if (res.cancel) {
                var conv = chatStore.ensureConversation({
                  peerId: peer.peerId,
                  peerName: peer.peerName,
                  peerAvatar: peer.peerAvatar,
                  contextLabel: peer.contextLabel,
                  greeting: peer.greeting,
                });
                navigateToChat(conv);
              }
            },
          });
          return;
        }
        wx.showToast({ title: (err && err.message) || '打开失败', icon: 'none', duration: 2800 });
      });
    return;
  }
  var conv = chatStore.ensureConversation({
    peerId: peer.peerId,
    peerName: peer.peerName,
    peerAvatar: peer.peerAvatar,
    contextLabel: peer.contextLabel,
    greeting: peer.greeting,
  });
  navigateToChat(conv);
}

function openChatList() {
  wx.navigateTo({ url: '/pages/sixin-list/sixin-list' });
}

module.exports = {
  openChat: openChat,
  openChatList: openChatList,
};
