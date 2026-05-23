function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var PROFILES = {
  1: {
    id: 1,
    name: '林小暖',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    verified: true,
    followed: false,
    bio: '热爱美食与摄影，在城市的街头巷尾寻找烟火气',
    fansText: '1.2k',
    followingText: '340',
    scoreText: '98',
    mainTag: '高级美食家',
    badges: [
      { icon: '🍲', label: '火锅达人' },
      { icon: '☕', label: '咖啡鉴赏' },
      { icon: '🍕', label: '西餐专家' },
    ],
    tabPosts: [
      { id: 'p1', title: 'Commune Social 小聚记录', meta: '2小时前 · 静安区' },
      { id: 'p2', title: '周末早午餐探店', meta: '3天前 · 徐汇区' },
    ],
    tabJoined: [
      { id: 'j1', title: '春日法式早午餐', meta: '4月12日 · 已结束' },
      { id: 'j2', title: '弄堂私房菜夜话', meta: '3月28日 · 已结束' },
    ],
    tabInitiated: [
      { id: 'i1', title: '周六寿司午饭', meta: '招募中 · 8人局' },
      { id: 'i2', title: '城市咖啡漫步', meta: '已满员' },
    ],
  },
  2: {
    id: 2,
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
    verified: true,
    followed: true,
    bio: '意面与葡萄酒爱好者，常驻上海。',
    fansText: '860',
    followingText: '120',
    scoreText: '88',
    mainTag: '认证美食家',
    badges: [
      { icon: '🍝', label: '意面达人' },
      { icon: '🍷', label: '侍酒入门' },
      { icon: '🥗', label: '轻食主义' },
    ],
    tabPosts: [{ id: 'd1', title: '意式小馆探店记录', meta: '5小时前' }],
    tabJoined: [{ id: 'd2', title: '牛排馆午餐', meta: '上周' }],
    tabInitiated: [],
  },
  3: {
    id: 3,
    name: '苏苏子',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    verified: false,
    followed: false,
    bio: '甜品控 · 记录每一次糖分快乐',
    fansText: '2.1k',
    followingText: '520',
    scoreText: '92',
    mainTag: '甜品探索者',
    badges: [
      { icon: '🍰', label: '烘焙同好' },
      { icon: '🧋', label: '奶茶地图' },
      { icon: '🍡', label: '日式和菓子' },
    ],
    tabPosts: [{ id: 's1', title: '今日份下午茶', meta: '昨天' }],
    tabJoined: [],
    tabInitiated: [{ id: 's2', title: '周末甜品局', meta: '报名中' }],
  },
  4: {
    id: 4,
    name: '王大厨',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80',
    verified: true,
    followed: false,
    bio: '中餐私房菜主理人，欢迎同好交流火候。',
    fansText: '3.4k',
    followingText: '210',
    scoreText: '96',
    mainTag: '资深主理人',
    badges: [
      { icon: '🔥', label: '火候控' },
      { icon: '🥢', label: '本帮传承' },
      { icon: '🐟', label: '河鲜时令' },
    ],
    tabPosts: [],
    tabJoined: [{ id: 'w1', title: '露台烧烤夜', meta: '已参加' }],
    tabInitiated: [{ id: 'w2', title: '弄堂私房菜', meta: '进行中' }],
  },
  99: {
    id: 99,
    name: '我',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&q=80',
    verified: false,
    followed: false,
    bio: '正在探索这座城市的味道与饭局。',
    fansText: '12',
    followingText: '48',
    scoreText: '76',
    mainTag: '约饭新手',
    badges: [
      { icon: '🍜', label: '面食爱好者' },
      { icon: '🌮', label: '小吃雷达' },
    ],
    tabPosts: [{ id: 'm1', title: '我发布的动态', meta: '最近' }],
    tabJoined: [],
    tabInitiated: [],
  },
};

function getPersonProfile(id) {
  var n = parseInt(id, 10);
  if (isNaN(n) || !PROFILES[n]) {
    return clone(PROFILES[1]);
  }
  return clone(PROFILES[n]);
}

module.exports = {
  getPersonProfile: getPersonProfile,
};
