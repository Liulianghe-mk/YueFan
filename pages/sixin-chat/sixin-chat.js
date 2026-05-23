var chatStore = require('../../utils/chat-store.js');
var chatApi = require('../../utils/chat-api.js');

Page({
  data: {
    statusBarHeight: 20,
    convId: '',
    serverId: null,
    useApi: false,
    peerId: '',
    peerName: '',
    peerAvatar: '',
    contextLabel: '',
    messages: [],
    inputText: '',
    scrollIntoView: '',
    sending: false,
    meAvatar: chatStore.ME_AVATAR,
  },

  onLoad(options) {
    var sh = 20;
    try {
      sh = wx.getWindowInfo().statusBarHeight || 20;
    } catch (e) {
      sh = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;
    }
    var useApi = !!chatApi.getApiBase();
    var serverId = options.serverId ? Number(decodeURIComponent(options.serverId)) : null;
    var convId = options.convId ? decodeURIComponent(options.convId) : '';
    var peerName = options.peerName ? decodeURIComponent(options.peerName) : '美食搭子';
    var peerAvatar = options.peerAvatar ? decodeURIComponent(options.peerAvatar) : chatStore.ME_AVATAR;
    var contextLabel = options.context ? decodeURIComponent(options.context) : '';
    var self = this;

    function applyConvId(id, sid) {
      self.setData({
        statusBarHeight: sh,
        convId: id,
        serverId: sid,
        useApi: useApi && sid != null && !isNaN(sid),
        peerId: options.peerId ? decodeURIComponent(options.peerId) : '',
        peerName: peerName,
        peerAvatar: peerAvatar,
        contextLabel: contextLabel,
      });
      self.loadMessages(true);
      if (!self.data.useApi) chatStore.markRead(id);
    }

    if (useApi && (isNaN(serverId) || serverId == null)) {
      chatApi
        .ensureConversation({
          peerId: options.peerId,
          peerName: peerName,
          peerAvatar: peerAvatar,
          contextLabel: contextLabel,
        })
        .then(function (conv) {
          applyConvId(String(conv.id), conv._serverId);
        })
        .catch(function () {
          if (!convId) {
            var local = chatStore.ensureConversation({
              peerId: options.peerId,
              peerName: peerName,
              peerAvatar: peerAvatar,
              contextLabel: contextLabel,
            });
            convId = local.id;
          }
          applyConvId(convId, null);
        });
      return;
    }

    if (!convId) {
      var conv = chatStore.ensureConversation({
        peerId: options.peerId,
        peerName: peerName,
        peerAvatar: peerAvatar,
        contextLabel: contextLabel,
      });
      convId = conv.id;
    }
    applyConvId(convId, useApi && !isNaN(serverId) ? serverId : null);
  },

  onShow() {
    if (this.data.convId) {
      this.loadMessages(false);
      if (!this.data.useApi) chatStore.markRead(this.data.convId);
    }
  },

  loadMessages(scroll) {
    var self = this;
    if (this.data.useApi && this.data.serverId != null) {
      chatApi
        .fetchMessages(this.data.serverId)
        .then(function (list) {
          var lastId = list.length ? 'msg-' + list[list.length - 1].id : '';
          var patch = { messages: list };
          if (scroll && lastId) patch.scrollIntoView = lastId;
          self.setData(patch);
        })
        .catch(function () {
          self.loadMessagesLocal(scroll);
        });
      return;
    }
    this.loadMessagesLocal(scroll);
  },

  loadMessagesLocal(scroll) {
    var list = chatStore.getMessages(this.data.convId);
    var lastId = list.length ? 'msg-' + list[list.length - 1].id : '';
    var patch = { messages: list };
    if (scroll && lastId) patch.scrollIntoView = lastId;
    this.setData(patch);
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onSend() {
    this.sendText((this.data.inputText || '').trim());
  },

  sendText(text) {
    if (this.data.sending) return;
    text = (text || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入消息', icon: 'none' });
      return;
    }
    var self = this;
    this.setData({ sending: true, inputText: '' });

    if (this.data.useApi && this.data.serverId != null) {
      chatApi
        .sendMessage(this.data.serverId, text)
        .then(function () {
          self.loadMessages(true);
          self.setData({ sending: false });
        })
        .catch(function (err) {
          self.setData({ sending: false });
          wx.showModal({
            title: '发送失败',
            content: (err && err.message) || '请稍后重试',
            showCancel: false,
          });
        });
      return;
    }

    var convId = this.data.convId;
    chatStore.appendMessage(convId, { from: 'me', type: 'text', content: text });
    this.loadMessages(true);
    chatStore.schedulePeerReply(convId, this.data.peerName);
    setTimeout(function () {
      self.loadMessages(true);
      self.setData({ sending: false });
    }, 1400);
  },

  onQuickTap(e) {
    var text = e.currentTarget.dataset.text;
    if (!text) return;
    this.sendText(text);
  },
});
