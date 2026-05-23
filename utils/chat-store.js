var STORAGE_KEY = 'yuefan_chat_data';

var ME_AVATAR =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80';

var SEED = {
  conversations: [
    {
      id: 'p-1',
      peerId: '1',
      peerName: '林小暖',
      peerAvatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
      contextLabel: '约饭 · Commune Social 小聚',
      lastMessage: '那周六 12 点见，我订位啦～',
      lastTime: '昨天',
      lastTs: 0,
      unread: 1,
    },
    {
      id: 'p-2',
      peerId: '2',
      peerName: 'David Chen',
      peerAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
      contextLabel: '约饭 · 意式小馆',
      lastMessage: '侍酒师推荐的那款白葡萄酒不错',
      lastTime: '周二',
      lastTs: 0,
      unread: 0,
    },
  ],
  messages: {
    'p-1': [
      { id: 'm1', from: 'peer', type: 'text', content: '你好呀，看到你对 Commune Social 那场约饭感兴趣？', time: '14:20', ts: 1 },
      { id: 'm2', from: 'me', type: 'text', content: '对的！我想一起参加，还有名额吗？', time: '14:22', ts: 2 },
      { id: 'm3', from: 'peer', type: 'text', content: '有的，目前还差 2 位就满员啦。', time: '14:25', ts: 3 },
      { id: 'm4', from: 'me', type: 'text', content: '太好了，我周六可以准时到。', time: '14:28', ts: 4 },
      { id: 'm5', from: 'peer', type: 'text', content: '那周六 12 点见，我订位啦～', time: '14:30', ts: 5 },
    ],
    'p-2': [
      { id: 'm6', from: 'peer', type: 'text', content: '上次意式小馆的手作意面你尝了吗？', time: '20:10', ts: 1 },
      { id: 'm7', from: 'me', type: 'text', content: '试了黑松露宽面，很惊艳。', time: '20:15', ts: 2 },
      { id: 'm8', from: 'peer', type: 'text', content: '侍酒师推荐的那款白葡萄酒不错', time: '20:18', ts: 3 },
    ],
  },
};

var AUTO_REPLIES = [
  '收到，我看看时间安排～',
  '好呀，到时候见！',
  '没问题，欢迎一起来约饭 🍽',
  '我这边也可以，咱们私聊定细节。',
  '哈哈好的，有消息我第一时间回你。',
];

function loadRaw() {
  try {
    var v = wx.getStorageSync(STORAGE_KEY);
    if (v && v.conversations && v.messages) return v;
  } catch (e) {}
  return null;
}

function saveRaw(data) {
  try {
    wx.setStorageSync(STORAGE_KEY, data);
  } catch (e) {}
}

function ensureSeed() {
  var raw = loadRaw();
  if (raw) return raw;
  var now = Date.now();
  var data = JSON.parse(JSON.stringify(SEED));
  var i;
  for (i = 0; i < data.conversations.length; i++) {
    data.conversations[i].lastTs = now - (data.conversations.length - i) * 86400000;
  }
  saveRaw(data);
  return data;
}

function peerKey(peerId, peerName) {
  var id = peerId != null ? String(peerId).trim() : '';
  if (id) return 'p-' + id;
  var name = (peerName || 'user').trim();
  return 'n-' + name;
}

function formatTimeLabel(ts) {
  if (!ts) return '';
  var d = new Date(ts);
  var now = new Date();
  var pad = function (n) {
    return n < 10 ? '0' + n : '' + n;
  };
  var hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
  if (d.toDateString() === now.toDateString()) return hm;
  var yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return '昨天';
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function getConversations() {
  var data = ensureSeed();
  return data.conversations
    .slice()
    .sort(function (a, b) {
      return (b.lastTs || 0) - (a.lastTs || 0);
    });
}

function getMessages(convId) {
  var data = ensureSeed();
  var list = data.messages[convId];
  return Array.isArray(list) ? list.slice() : [];
}

function getUnreadTotal() {
  return getConversations().reduce(function (sum, c) {
    return sum + (c.unread || 0);
  }, 0);
}

function ensureConversation(peer) {
  var data = ensureSeed();
  var key = peerKey(peer.peerId, peer.peerName);
  var found = null;
  var i;
  for (i = 0; i < data.conversations.length; i++) {
    if (data.conversations[i].id === key) {
      found = data.conversations[i];
      break;
    }
  }
  if (!found) {
    found = {
      id: key,
      peerId: peer.peerId != null ? String(peer.peerId) : '',
      peerName: (peer.peerName && String(peer.peerName).trim()) || '美食搭子',
      peerAvatar: (peer.peerAvatar && String(peer.peerAvatar).trim()) || ME_AVATAR,
      contextLabel: (peer.contextLabel && String(peer.contextLabel).trim()) || '',
      lastMessage: '',
      lastTime: '',
      lastTs: 0,
      unread: 0,
    };
    data.conversations.unshift(found);
    data.messages[key] = [];
    if (peer.greeting) {
      appendMessageInternal(data, key, {
        from: 'peer',
        type: 'text',
        content: peer.greeting,
      });
    }
    saveRaw(data);
  } else if (peer.contextLabel && !found.contextLabel) {
    found.contextLabel = String(peer.contextLabel).trim();
    saveRaw(data);
  }
  return found;
}

function appendMessageInternal(data, convId, msg) {
  if (!data.messages[convId]) data.messages[convId] = [];
  var ts = Date.now();
  var row = {
    id: 'm' + ts + '-' + Math.floor(Math.random() * 1000),
    from: msg.from === 'me' ? 'me' : 'peer',
    type: msg.type || 'text',
    content: (msg.content && String(msg.content).trim()) || '',
    time: formatTimeLabel(ts),
    ts: ts,
  };
  data.messages[convId].push(row);
  var conv = null;
  var i;
  for (i = 0; i < data.conversations.length; i++) {
    if (data.conversations[i].id === convId) {
      conv = data.conversations[i];
      break;
    }
  }
  if (conv) {
    conv.lastMessage = row.content;
    conv.lastTime = row.time;
    conv.lastTs = ts;
    if (row.from === 'peer') conv.unread = (conv.unread || 0) + 1;
  }
  saveRaw(data);
  return row;
}

function appendMessage(convId, msg) {
  var data = ensureSeed();
  return appendMessageInternal(data, convId, msg);
}

function markRead(convId) {
  var data = ensureSeed();
  var i;
  for (i = 0; i < data.conversations.length; i++) {
    if (data.conversations[i].id === convId) {
      data.conversations[i].unread = 0;
      saveRaw(data);
      return;
    }
  }
}

function pickAutoReply() {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

function schedulePeerReply(convId, peerName) {
  setTimeout(function () {
    appendMessage(convId, {
      from: 'peer',
      type: 'text',
      content: pickAutoReply(),
    });
  }, 900 + Math.floor(Math.random() * 800));
}

module.exports = {
  ME_AVATAR: ME_AVATAR,
  getConversations: getConversations,
  getMessages: getMessages,
  getUnreadTotal: getUnreadTotal,
  ensureConversation: ensureConversation,
  appendMessage: appendMessage,
  markRead: markRead,
  schedulePeerReply: schedulePeerReply,
  formatTimeLabel: formatTimeLabel,
};
