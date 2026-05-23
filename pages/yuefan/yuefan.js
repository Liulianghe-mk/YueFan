const tabNav = require('../../utils/tab-nav.js');
const tabIndexById = tabNav.tabIndexById;
const parseFromQuery = tabNav.parseFromQuery;
const tabHighlightStyle = tabNav.tabHighlightStyle;
const meetupsApi = require('../../utils/meetups-api.js');
const authGuard = require('../../utils/auth-guard.js');
const appAuth = require('../../utils/app-auth.js');

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
    events: [
      {
        id: 3,
        cover:
          'https://images.unsplash.com/photo-1579584432223-c7ecc17ec883?w=900&auto=format&fit=crop&q=80',
        joined: 4,
        total: 8,
        tag: '日本料理',
        distance: '800m',
        district: '静安区',
        title: '周六寿司午饭',
        desc: 'Omakase 禅店板前位，想约几位日料同好一起品鉴当季鱼获。',
        hostName: '陈伟',
        hostAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80',
        hostRating: '4.9',
        hostBadge: '认证发起人',
      },
      {
        id: 1,
        cover:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80',
        joined: 6,
        total: 8,
        tag: '法式私厨',
        distance: '1.2km',
        district: '静安区',
        title: '春日午后：复古公寓里的法式慵懒早午餐',
        desc:
          '在这个周六的阳光午后，邀你来到我的复古公寓，分享精心烹制的红酒烩鸡与自制…',
        hostName: 'Claire Y.',
        hostAvatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
        hostRating: '4.9',
        hostBadge: '资深东道主',
      },
      {
        id: 2,
        cover:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
        joined: 4,
        total: 6,
        tag: '本帮小馆',
        distance: '2.4km',
        district: '黄浦区',
        title: '周末夜：弄堂里的私房菜与黄酒小酌',
        desc: '想约几位同好一起探店，聊聊城市与美食。菜单以时令河鲜为主，座位有限…',
        hostName: '阿木',
        hostAvatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB5mro7dRtxplBgfAdHi9zXZYaRfgytpYpDIHUpigf8H-eZHL8DeUUT7r6ddvWez98yyRmjWgRf532pRlR4iWCMmfx0eSE6COV1yI6DX3KA2St6AIkEotz6RZNWVOSv0gpJZAGmRSkFsb-032YMj1rri_phtF04TilUz-_opiN2Kloo_STgtGe6sgmgkDMn3-ZbHRuG_AExbhkdtqWie9AGPato3A3oCMSh4Uh0SzxTl24lJQ7zmk9BNdPlOUXToLe2ns661qwAX0W5',
        hostRating: '4.8',
        hostBadge: '认证东道主',
      },
    ],
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
    const meetIdx = 1;
    if (from !== meetIdx || fromId !== tabs[meetIdx].id) {
      const self = this;
      setTimeout(function () {
        self.setData({
          activeTabIndex: meetIdx,
          activeTab: tabs[meetIdx].id,
          tabHighlightStyle: tabHighlightStyle(meetIdx),
        });
      }, 20);
    }
    this.loadMeetupsList();
  },

  onShow() {
    if (!appAuth.isLoggedIn()) {
      authGuard.redirectAuth('login');
      return;
    }
    this.loadMeetupsList();
  },

  onPullDownRefresh() {
    this.loadMeetupsList();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 400);
  },

  loadMeetupsList() {
    const self = this;
    meetupsApi
      .fetchPublishedMeetups({ page: 0, size: 50 })
      .then(function (res) {
        if (!res) return;
        self.setData({ events: res.yuefanEvents });
      })
      .catch(function (err) {
        console.warn('[yuefan] meetups', err);
        wx.showToast({ title: '活动列表加载失败', icon: 'none' });
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
      wx.reLaunch({ url: '/pages/wode/wode?from=' + fromIdx });
      return;
    }
    const idx = this.data.tabs.findIndex(function (t) {
      return t.id === tab;
    });
    if (idx < 0) return;
    this.setData({ activeTab: tab, activeTabIndex: idx, tabHighlightStyle: tabHighlightStyle(idx) });
  },

  onOpenDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    wx.navigateTo({ url: '/pages/yuefan-detail/yuefan-detail?id=' + id });
  },

  onJoinTap(e) {
    var id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    var self = this;
    if (!meetupsApi.getApiBase()) {
      wx.showToast({ title: '未连接后端', icon: 'none' });
      return;
    }
    var item = null;
    var events = this.data.events || [];
    for (var i = 0; i < events.length; i++) {
      if (String(events[i].id) === String(id)) {
        item = events[i];
        break;
      }
    }
    if (item && (item.joinedByMe || item.pendingByMe)) {
      wx.navigateTo({ url: '/pages/yuefan-detail/yuefan-detail?id=' + id });
      return;
    }
    if (item && !item.canJoin) {
      wx.navigateTo({ url: '/pages/yuefan-detail/yuefan-detail?id=' + id });
      return;
    }
    meetupsApi
      .joinMeetup(id)
      .then(function (res) {
        var msg = '加入成功';
        if (res && res.pendingApproval) msg = '已提交申请，等待发起人审核';
        else if (res && res.alreadyJoined && res.meetup && res.meetup.myMembershipStatus === 'PENDING') {
          msg = '您已申请，等待审核';
        } else if (res && res.alreadyJoined) msg = '您已加入';
        wx.showToast({ title: msg, icon: 'success' });
        self.loadMeetupsList();
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '加入失败', icon: 'none' });
      });
  },

  onStopBubble() {},
})
