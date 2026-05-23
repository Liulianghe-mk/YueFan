var chatStore = require('../../utils/chat-store.js');
var chatApi = require('../../utils/chat-api.js');

Page({
  data: {
    statusBarHeight: 20,
    conversations: [],
    unreadTotal: 0,
  },

  onLoad() {
    var sh = 20;
    try {
      sh = wx.getWindowInfo().statusBarHeight || 20;
    } catch (e) {
      sh = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;
    }
    this.setData({ statusBarHeight: sh });
    this.refreshList();
  },

  onShow() {
    this.refreshList();
  },

  refreshList() {
    var self = this;
    if (chatApi.getApiBase()) {
      chatApi
        .fetchConversations()
        .then(function (list) {
          if (!list) {
            self.refreshLocal();
            return;
          }
          self.setData({
            conversations: list,
            unreadTotal: list.reduce(function (s, c) {
              return s + (c.unread || 0);
            }, 0),
          });
        })
        .catch(function () {
          self.refreshLocal();
        });
      return;
    }
    this.refreshLocal();
  },

  refreshLocal() {
    var list = chatStore.getConversations();
    this.setData({
      conversations: list,
      unreadTotal: chatStore.getUnreadTotal(),
    });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onOpenChat(e) {
    var id = e.currentTarget.dataset.id;
    var list = this.data.conversations || [];
    var row = list.find(function (c) {
      return c.id === id;
    });
    if (!row) return;
    var q = [
      'convId=' + encodeURIComponent(row.id),
      'peerId=' + encodeURIComponent(row.peerId || ''),
      'peerName=' + encodeURIComponent(row.peerName || ''),
      'peerAvatar=' + encodeURIComponent(row.peerAvatar || ''),
    ];
    if (row.contextLabel) q.push('context=' + encodeURIComponent(row.contextLabel));
    if (row._serverId != null) q.push('serverId=' + encodeURIComponent(String(row._serverId)));
    wx.navigateTo({ url: '/pages/sixin-chat/sixin-chat?' + q.join('&') });
  },
});
