const tabNav = require('../../utils/tab-nav.js');
const tabIndexById = tabNav.tabIndexById;
const parseFromQuery = tabNav.parseFromQuery;
const tabHighlightStyle = tabNav.tabHighlightStyle;
const chatNav = require('../../utils/chat-nav.js');
const chatApi = require('../../utils/chat-api.js');
const chatStore = require('../../utils/chat-store.js');
const followApi = require('../../utils/follow-api.js');
const meetupsApi = require('../../utils/meetups-api.js');
const appAuth = require('../../utils/app-auth.js');
const userApi = require('../../utils/user-api.js');
const authGuard = require('../../utils/auth-guard.js');

Page({
  data: {
    loggedIn: false,
    statusBarHeight: 20,
    activeTab: 'discover',
    activeTabIndex: 0,
    tabHighlightStyle: tabHighlightStyle(0),
    activityTab: 'upcoming',
    tabs: [
      { id: 'discover', label: '发现', icon: '/images/tabbar/discover.svg' },
      { id: 'meet', label: '约饭', icon: '/images/tabbar/meet.svg' },
      { id: 'create', label: '发起', icon: '/images/tabbar/create.svg' },
      { id: 'feed', label: '动态', icon: '/images/tabbar/feed.svg' },
      { id: 'profile', label: '我的', icon: '/images/tabbar/profile.svg' },
    ],
    user: {
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
      name: 'Leon Zhang',
      levelText: 'LV.4 美食家',
      bio: '嗜辣如命，川菜探索者。一直在寻找城里最好吃的火锅。',
    },
    initiatedCount: 0,
    pendingApplicationsTotal: 0,
    friendCount: 0,
    friendAvatars: [],
    friendExtra: 0,
    unreadMsg: 0,
    upcomingActivities: [
      {
        id: 1,
        month: '10月',
        day: '12',
        status: 'confirmed',
        title: '香辣成都午餐',
        venue: '海底捞火锅, CBD店',
        time: '12:30 PM',
        cover:
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80',
        faces: [
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&q=80',
        ],
        action: 'detail',
      },
      {
        id: 2,
        month: '10月',
        day: '14',
        status: 'pending',
        title: '粤式早茶',
        venue: '点都德, 天河店',
        time: '10:00 AM',
        cover:
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
        faces: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80',
        ],
        action: 'manage',
      },
    ],
    endedActivities: [
      {
        id: 3,
        month: '9月',
        day: '28',
        status: 'ended',
        title: '周末露台烧烤',
        venue: '外滩某露台餐厅',
        time: '18:00',
        cover:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
        faces: [
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&q=80',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80',
        ],
        action: 'detail',
      },
    ],
  },

  onShow() {
    if (!appAuth.isLoggedIn()) {
      authGuard.redirectAuth('login');
      return;
    }
    this.loadUserProfile();
    this.loadUnreadMsg();
    this.loadFriends();
    this.loadMyActivities();
  },

  loadUserProfile() {
    var self = this;
    var loggedIn = appAuth.isLoggedIn();
    self.setData({ loggedIn: loggedIn });
    if (!loggedIn) {
      self.setData({
        user: {
          avatar: userApi.DEFAULT_AVATAR,
          name: '点击登录',
          levelText: '未登录',
          bio: '登录后可同步约饭、动态与个人资料',
        },
      });
      return;
    }
    var cached = userApi.getCachedProfile();
    if (cached) {
      var u = userApi.mapMeToWodeUser(cached);
      if (u) self.setData({ user: u });
    }
    userApi
      .fetchMe()
      .then(function (dto) {
        if (!dto) return;
        var mapped = userApi.mapMeToWodeUser(dto);
        if (mapped) self.setData({ user: mapped, loggedIn: true });
      })
      .catch(function () {});
  },

  onOpenLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  /** 已登录：编辑头像、昵称、简介 */
  onEditProfile() {
    if (!appAuth.isLoggedIn()) {
      this.onOpenLogin();
      return;
    }
    wx.navigateTo({ url: '/pages/login/login?mode=register&edit=1' });
  },

  loadMyActivities() {
    var self = this;
    if (!meetupsApi.getApiBase()) return;
    meetupsApi
      .fetchMyActivities()
      .then(function (data) {
        if (!data) return;
        var upcoming = (data.upcoming || [])
          .map(meetupsApi.mapMyActivityToWodeCard)
          .filter(Boolean);
        var ended = (data.ended || []).map(meetupsApi.mapMyActivityToWodeCard).filter(Boolean);
        self.setData({
          upcomingActivities: upcoming,
          endedActivities: ended,
          initiatedCount: data.initiatedCount != null ? data.initiatedCount : 0,
          pendingApplicationsTotal:
            data.pendingApplicationsTotal != null ? data.pendingApplicationsTotal : 0,
        });
      })
      .catch(function () {});
  },

  loadFriends() {
    var self = this;
    followApi
      .fetchFollowing()
      .then(function (list) {
        var friends = list || [];
        var count = friends.length;
        var avatars = friends.slice(0, 3).map(function (f) {
          return userApi.normalizeImageSrc(f.avatarUrl);
        });
        var extra = count > avatars.length ? count - avatars.length : 0;
        self.setData({
          friendCount: count,
          friendAvatars: avatars,
          friendExtra: extra,
        });
      })
      .catch(function () {
        self.setData({ friendCount: 0, friendAvatars: [], friendExtra: 0 });
      });
  },

  onOpenFriends() {
    wx.navigateTo({ url: '/pages/wode-friends/wode-friends' });
  },

  loadUnreadMsg() {
    var self = this;
    if (chatApi.getApiBase()) {
      chatApi
        .fetchConversations()
        .then(function (list) {
          if (!list) {
            self.setData({ unreadMsg: chatStore.getUnreadTotal() });
            return;
          }
          var n = list.reduce(function (s, c) {
            return s + (c.unread || 0);
          }, 0);
          self.setData({ unreadMsg: n });
        })
        .catch(function () {
          self.setData({ unreadMsg: chatStore.getUnreadTotal() });
        });
      return;
    }
    this.setData({ unreadMsg: chatStore.getUnreadTotal() });
  },

  onOpenMessages() {
    chatNav.openChatList();
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
    const profileIdx = 4;
    if (from !== profileIdx || fromId !== tabs[profileIdx].id) {
      const self = this;
      setTimeout(function () {
        self.setData({
          activeTabIndex: profileIdx,
          activeTab: tabs[profileIdx].id,
          tabHighlightStyle: tabHighlightStyle(profileIdx),
        });
      }, 20);
    }
  },

  switchActivityTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab) return;
    this.setData({ activityTab: tab });
  },

  onActivityTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    const pool = this.data.activityTab === 'ended' ? 'ended' : 'upcoming';
    var item = null;
    var list =
      pool === 'ended' ? this.data.endedActivities : this.data.upcomingActivities;
    for (var i = 0; i < (list || []).length; i++) {
      if (String(list[i].id) === String(id)) {
        item = list[i];
        break;
      }
    }
    var mode = item && (item.action === 'manage' || item.status === 'manage') ? '&mode=manage' : '';
    wx.navigateTo({
      url: '/pages/wode-activity-detail/wode-activity-detail?id=' + id + '&pool=' + pool + mode,
    });
  },

  onMenuSettings() {
    if (appAuth.isLoggedIn()) {
      this.onEditProfile();
      return;
    }
    this.onOpenLogin();
  },

  onMenuHelp() {
    wx.showToast({ title: '帮助与反馈', icon: 'none' });
  },

  onMenuLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmColor: '#a8483c',
      success: function (res) {
        if (!res.confirm) return;
        appAuth.logout();
        wx.showToast({ title: '已退出', icon: 'none' });
        setTimeout(function () {
          authGuard.redirectAuth('login');
        }, 300);
      },
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
      wx.reLaunch({ url: '/pages/dongtai/dongtai?from=' + fromIdx });
      return;
    }
    if (tab === 'profile') {
      return;
    }
  },
});
