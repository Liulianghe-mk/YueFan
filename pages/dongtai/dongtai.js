const tabNav = require('../../utils/tab-nav.js');
const tabIndexById = tabNav.tabIndexById;
const parseFromQuery = tabNav.parseFromQuery;
const tabHighlightStyle = tabNav.tabHighlightStyle;
const feedStore = require('../../utils/feed-store.js');
const appContentApi = require('../../utils/app-content-api.js');
const followApi = require('../../utils/follow-api.js');
const authGuard = require('../../utils/auth-guard.js');
const appAuth = require('../../utils/app-auth.js');

const BASE_POSTS = [
  {
    id: 1,
    authorName: '林小暖',
    authorAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    authorProfileId: 1,
    timeText: '2小时前',
    followed: false,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80',
    gatherBadge: '8人已聚',
    location: '静安区 · The Commune Social',
    content:
      '今晚在 Commune Social 的小聚太治愈了！创意西班牙 tapas 配酒，每一道都像在舌尖跳舞。还认识了两位同样爱美食的朋友，聊城市、聊旅行、聊下一顿约饭——这就是我想分享的「约饭」时刻。下次想试试他们的周末早午餐，有人一起吗？🥂',
    likes: 128,
    comments: 24,
    shares: 8,
    replyAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&q=80',
    ],
    replyExtra: 5,
  },
  {
    id: 2,
    authorName: 'David Chen',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
    authorProfileId: 2,
    timeText: '5小时前',
    followed: true,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
    gatherBadge: '5人已聚',
    location: '徐汇区 · Osteria',
    content: '周末意式小馆探店记录：手工意面与侍酒师的推荐绝配，推荐给同样喜欢慢食的你。',
    likes: 86,
    comments: 12,
    shares: 5,
    replyAvatars: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&q=80',
    ],
    replyExtra: 3,
  },
];

Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'discover',
    activeTabIndex: 0,
    tabHighlightStyle: tabHighlightStyle(0),
    tabs: [
      { id: 'discover', label: '发现', icon: '/images/tabbar/discover.svg' },
      { id: 'meet', label: '约饭', icon: '/images/tabbar/meet.svg' },
      { id: 'create', label: '发起', icon: '/images/tabbar/create.svg' },
      { id: 'feed', label: '动态', icon: '/images/tabbar/feed.svg' },
      { id: 'profile', label: '我的', icon: '/images/tabbar/profile.svg' },
    ],
    popularHosts: [
      {
        id: 1,
        name: '林小暖',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
      },
      {
        id: 2,
        name: 'David Chen',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
      },
      {
        id: 3,
        name: '苏苏子',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
      },
      {
        id: 4,
        name: '王大厨',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
      },
    ],
    posts: [],
  },

  refreshPostsFallback() {
    const user = feedStore.getUserPosts();
    const prev = this.data.posts || [];
    const base = BASE_POSTS.map(function (b) {
      const old = prev.find(function (p) {
        return p.id === b.id;
      });
      if (old && typeof old.followed === 'boolean') {
        return Object.assign({}, b, { followed: old.followed });
      }
      return b;
    });
    this.setData({ posts: user.concat(base) });
  },

  /** 动态列表、热门主理人与管理端 / 后端同一数据源 */
  loadFeedFromServer() {
    var self = this;
    Promise.all([appContentApi.fetchFeedPosts(), appContentApi.fetchInfluencers()])
      .then(function (parts) {
        var posts = parts[0];
        var influencers = parts[1];
        if (posts == null && influencers == null) {
          self.refreshPostsFallback();
          return;
        }
        var infList = influencers || [];
        var user = feedStore.getUserPosts();
        var patch = {};
        if (infList.length) {
          patch.popularHosts = infList.map(appContentApi.mapInfluencerToPopularHost);
        }
        if (posts && posts.length) {
          var apiCards = posts.map(function (dto) {
            var pid = appContentApi.matchInfluencerProfileId(dto.authorName, infList);
            return appContentApi.mapFeedPostToListCard(dto, pid);
          });
          patch.posts = user.concat(apiCards);
        } else {
          var prev = self.data.posts || [];
          var base = BASE_POSTS.map(function (b) {
            var old = prev.find(function (p) {
              return p.id === b.id;
            });
            if (old && typeof old.followed === 'boolean') {
              return Object.assign({}, b, { followed: old.followed });
            }
            return b;
          });
          patch.posts = user.concat(base);
        }
        if (Object.keys(patch).length) {
          self.setData(patch, function () {
            self.syncPostsFollowed();
          });
        } else {
          self.syncPostsFollowed();
        }
      })
      .catch(function (err) {
        console.warn('[dongtai] sync', err);
        self.refreshPostsFallback();
      });
  },

  syncPostsFollowed() {
    var self = this;
    followApi.fetchFollowedInfluencerIds().then(function (ids) {
      var posts = followApi.applyFollowedToPosts(self.data.posts, ids);
      if (posts.length) self.setData({ posts: posts });
    });
  },

  refreshPosts() {
    this.loadFeedFromServer();
  },

  onLoad(options) {
    var self = this;
    authGuard.requireMainAccess().then(function (ok) {
      if (!ok) return;
      self.initPage(options);
    });
  },

  initPage(options) {
    let sh = 20;
    try {
      sh = wx.getWindowInfo().statusBarHeight || 20;
    } catch (e) {
      sh = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;
    }
    const tabs = this.data.tabs;
    const max = tabs.length - 1;
    const from = parseFromQuery(options, max);
    const fromId = tabs[from].id;
    this.setData({
      statusBarHeight: sh,
      activeTabIndex: from,
      activeTab: fromId,
      tabHighlightStyle: tabHighlightStyle(from),
    });
    const feedIdx = 3;
    if (from !== feedIdx || fromId !== tabs[feedIdx].id) {
      const self = this;
      setTimeout(function () {
        self.setData({
          activeTabIndex: feedIdx,
          activeTab: tabs[feedIdx].id,
          tabHighlightStyle: tabHighlightStyle(feedIdx),
        });
      }, 20);
    }
    this.refreshPosts();
  },

  onShow() {
    if (!appAuth.isLoggedIn()) {
      authGuard.redirectAuth('login');
      return;
    }
    this.refreshPosts();
  },

  onPullDownRefresh() {
    this.loadFeedFromServer();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 400);
  },

  onGoPublish() {
    wx.navigateTo({ url: '/pages/dongtai-publish/dongtai-publish' });
  },

  onOpenPostDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    wx.navigateTo({ url: '/pages/dongtai-detail/dongtai-detail?id=' + id });
  },

  onOpenProfile(e) {
    const id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    wx.navigateTo({ url: '/pages/profile-detail/profile-detail?id=' + id });
  },

  onFollowTap(e) {
    const influencerId = e.currentTarget.dataset.influencerId;
    if (influencerId == null || influencerId === '') return;
    const pid = Number(influencerId);
    if (isNaN(pid) || pid <= 0) {
      wx.showToast({ title: '暂无法关注该用户', icon: 'none' });
      return;
    }
    var self = this;
    var post = (this.data.posts || []).find(function (p) {
      return Number(p.authorProfileId) === pid;
    });
    if (!post) return;
    var next = !post.followed;
    followApi
      .setFollow(pid, next)
      .then(function () {
        var posts = self.data.posts.map(function (p) {
          if (Number(p.authorProfileId) === pid) {
            return Object.assign({}, p, { followed: next });
          }
          return p;
        });
        self.setData({ posts: posts });
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '关注失败', icon: 'none' });
      });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab) return;
    const fromIdx = tabIndexById(this.data.tabs, this.data.activeTab);
    if (tab === 'discover') {
      wx.reLaunch({ url: '/pages/shouye/shouye?from=' + fromIdx });
      return;
    }
    if (tab === 'meet') {
      wx.reLaunch({ url: '/pages/yuefan/yuefan?from=' + fromIdx });
      return;
    }
    if (tab === 'create') {
      wx.reLaunch({ url: '/pages/faqi/faqi?from=' + fromIdx });
      return;
    }
    if (tab === 'feed') {
      return;
    }
    if (tab === 'profile') {
      wx.reLaunch({ url: '/pages/wode/wode?from=' + fromIdx });
      return;
    }
    const idx = this.data.tabs.findIndex(function (t) {
      return t.id === tab;
    });
    if (idx < 0) return;
    this.setData({ activeTab: tab, activeTabIndex: idx, tabHighlightStyle: tabHighlightStyle(idx) });
  },
});
