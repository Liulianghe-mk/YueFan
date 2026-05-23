var feedStore = require('./feed-store.js');

var IMG_TAPAS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
];

var DETAIL_1 = {
  id: 1,
  authorName: '林小暖',
  authorAvatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
  timeText: '2小时前',
  followed: false,
  images: IMG_TAPAS,
  gatherBadge: '8人已聚',
  location: '静安区 · The Commune Social',
  content:
    '今晚在 Commune Social 的小聚太治愈了！创意西班牙 tapas 配酒，每一道都像在舌尖跳舞。还认识了两位同样爱美食的朋友，聊城市、聊旅行、聊下一顿约饭——这就是我想分享的「约饭」时刻。下次想试试他们的周末早午餐，有人一起吗？🥂',
  likes: 128,
  comments: 24,
  shares: 8,
  commentList: [
    {
      id: 101,
      authorName: 'David Chen',
      authorAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
      timeText: '1小时前',
      content: '氛围感拉满！下次周末早午餐算我一个～',
    },
    {
      id: 102,
      authorName: '苏苏子',
      authorAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80',
      timeText: '45分钟前',
      content: '已收藏！正好下周在静安附近，想去试试。',
    },
    {
      id: 103,
      authorName: '王大厨',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&q=80',
      timeText: '30分钟前',
      content: '配酒思路很专业，学习了。',
    },
  ],
};

var DETAIL_2 = {
  id: 2,
  authorName: 'David Chen',
  authorAvatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
  timeText: '5小时前',
  followed: true,
  images: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80',
  ],
  gatherBadge: '5人已聚',
  location: '徐汇区 · Osteria',
  content: '周末意式小馆探店记录：手工意面与侍酒师的推荐绝配，推荐给同样喜欢慢食的你。',
  likes: 86,
  comments: 12,
  shares: 5,
  commentList: [
    {
      id: 201,
      authorName: '林小暖',
      authorAvatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
      timeText: '3小时前',
      content: '这家我也去过，侍酒师确实厉害！',
    },
    {
      id: 202,
      authorName: '苏苏子',
      authorAvatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80',
      timeText: '2小时前',
      content: '马克了，谢谢分享～',
    },
  ],
};

var BY_ID = {
  1: DETAIL_1,
  2: DETAIL_2,
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function buildFromListPost(p) {
  var imgs = [];
  if (p.images && p.images.length) {
    imgs = p.images.slice();
  } else if (p.image) {
    imgs = [p.image];
  }
  return {
    id: p.id,
    authorName: p.authorName,
    authorAvatar: p.authorAvatar,
    timeText: p.timeText,
    followed: !!p.followed,
    images: imgs,
    gatherBadge: p.gatherBadge || '',
    location: p.location || '',
    content: p.content || '',
    likes: typeof p.likes === 'number' ? p.likes : 0,
    comments: typeof p.comments === 'number' ? p.comments : 0,
    shares: typeof p.shares === 'number' ? p.shares : 0,
    commentList: [
      {
        id: 901,
        authorName: 'David Chen',
        authorAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
        timeText: '1小时前',
        content: '好棒！下次带我一起～',
      },
      {
        id: 902,
        authorName: '苏苏子',
        authorAvatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80',
        timeText: '45分钟前',
        content: '种草了，记下来！',
      },
    ],
  };
}

function getFeedPostDetail(id) {
  var n = parseInt(id, 10);
  if (!isNaN(n) && BY_ID[n]) {
    return clone(BY_ID[n]);
  }
  var user = feedStore.getUserPosts();
  for (var i = 0; i < user.length; i++) {
    if (user[i].id === n) {
      return buildFromListPost(user[i]);
    }
  }
  return clone(DETAIL_1);
}

module.exports = {
  getFeedPostDetail: getFeedPostDetail,
};
