// index.js
const tabNav = require('../../utils/tab-nav.js');
const tabIndexById = tabNav.tabIndexById;
const parseFromQuery = tabNav.parseFromQuery;
const tabHighlightStyle = tabNav.tabHighlightStyle;
const meetupsApi = require('../../utils/meetups-api.js');
const appContentApi = require('../../utils/app-content-api.js');
const authGuard = require('../../utils/auth-guard.js');
const appAuth = require('../../utils/app-auth.js');

/** 发现页「附近的约饭」预览条数，完整列表见 shouye-meetup-list */
const DISCOVER_MEETUP_PREVIEW = 3;

Page({
    data: {
      activeTab: 'discover',
      activeTabIndex: 0,
      categories: [{ id: 'all', name: '全部' }],
      tabHighlightStyle: tabHighlightStyle(0),
      tabs: [
        { id: 'discover', label: '发现', icon: '/images/tabbar/discover.svg' },
        { id: 'meet', label: '约饭', icon: '/images/tabbar/meet.svg' },
        { id: 'create', label: '发起', icon: '/images/tabbar/create.svg' },
        { id: 'feed', label: '动态', icon: '/images/tabbar/feed.svg' },
        { id: 'profile', label: '我的', icon: '/images/tabbar/profile.svg' },
      ],
      activeCategory: 'all',
      recommendSwiperIndex: 0,
      recommendCurrent: 0,
      recommendations: [
        {
          id: 1,
          name: '瑞穗寿司',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE9Cx3W-BI4zAI5z3h3AdDdpmDFsEZPBxu9U_TMIW1BhVVSBtVFwYx-QLHNnUFpYDU0imrpzT7HQoz7R9kX5vCLV4ljFMBiGl20yE8nTe1JQnIvfCiWnfl8DKzNH_gobDFlUkGelLlTRCZxDeiZYqiKAxuIDU6do8eZS4eQS6aW1C0-fndRG-yxdxGgjhlu7AbDhv-RmxxdHHInlkqKyC2obCeoSroTe9MAAm9VjxXHvBww9MiV_yaN7UUeh7ZI0VUc4gjJN7qGt5G',
          rating: 4.9,
          tags: ['日料', '精致餐饮'],
          price: 580,
        },
        {
          id: 2,
          name: 'Canvas 烘焙坊',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZenKcM-NHbWtA5xXRGd1u5w3bjXSnpoeRO9GkwcVyi3K2xc9OZdET6-08slwLXDp71a4ae9JEmzGAmNkndVc8tN2BaQdqG4qQG99r4d1LRTliHMsydvsULvl7P2N0PDBMAoPkHV0WMEicGHgjGXqZ7gFt5jaxI5sny65QkY2UXwnmm4mCX21j6YacemYLwkbAYnddX6HlPhnyzQmVsVEvXg_52GDoD8anOn3uSszPqIh6cHB-BiEKWcUNigyAGlvE2gXkaw6fysY',
          rating: 4.7,
          tags: ['咖啡馆', '生活方式'],
          price: 85,
        }
      ],
      meetupTotal: 0,
      showMeetupMore: false,
      meetups: [
        {
          id: 1,
          title: '牛排馆午餐',
          location: '上海外滩',
          time: '今天 12:30',
          joined: 3,
          total: 4,
          hostAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
          verified: true,
          badgeActive: true,
          ctaPrimary: true,
          ctaLabel: '加入',
        },
        {
          id: 2,
          title: '老城厢早茶',
          location: '上海城隍庙',
          time: '明天 11:00',
          joined: 1,
          total: 6,
          hostAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5mro7dRtxplBgfAdHi9zXZYaRfgytpYpDIHUpigf8H-eZHL8DeUUT7r6ddvWez98yyRmjWgRf532pRlR4iWCMmfx0eSE6COV1yI6DX3KA2St6AIkEotz6RZNWVOSv0gpJZAGmRSkFsb-032YMj1rri_phtF04TilUz-_opiN2Kloo_STgtGe6sgmgkDMn3-ZbHRuG_AExbhkdtqWie9AGPato3A3oCMSh4Uh0SzxTl24lJQ7zmk9BNdPlOUXToLe2ns661qwAX0W5',
          verified: false,
          badgeActive: false,
          ctaPrimary: false,
          ctaLabel: '查看',
        }
      ]
    },

    startRecommendAutoplay() {
      this.stopRecommendAutoplay();
      const recs = this.data.recommendations;
      if (!recs || recs.length < 2) return;
      const self = this;
      const intervalMs = 4500;
      this._recommendAutoplayTimer = setInterval(function () {
        const list = self.data.recommendations;
        if (!list || list.length < 2) return;
        const n = list.length;
        const next = (self.data.recommendCurrent + 1) % n;
        self.setData({ recommendCurrent: next, recommendSwiperIndex: next });
      }, intervalMs);
    },

    stopRecommendAutoplay() {
      if (this._recommendAutoplayTimer) {
        clearInterval(this._recommendAutoplayTimer);
        this._recommendAutoplayTimer = null;
      }
    },
  
    onLoad(options) {
      var self = this;
      authGuard.requireMainAccess().then(function (ok) {
        if (!ok) return;
        self.initPage(options);
      });
    },

    initPage(options) {
      const tabs = this.data.tabs;
      const max = tabs.length - 1;
      const from = parseFromQuery(options, max);
      const fromId = tabs[from].id;
      this.setData({
        activeTabIndex: from,
        activeTab: fromId,
        tabHighlightStyle: tabHighlightStyle(from),
      });
      const discoverIdx = 0;
      if (from !== discoverIdx || fromId !== tabs[discoverIdx].id) {
        const self = this;
        setTimeout(function () {
          self.setData({
            activeTabIndex: discoverIdx,
            activeTab: tabs[discoverIdx].id,
            tabHighlightStyle: tabHighlightStyle(discoverIdx),
          });
        }, 20);
      }
      this.loadDiscoverFromServer();
    },

    loadMeetupsList() {
      const self = this;
      meetupsApi
        .fetchPublishedMeetups({ page: 0, size: 50 })
        .then(function (res) {
          if (!res) return;
          var all = res.shouyeMeetups || [];
          self.setData({
            meetupTotal: all.length,
            showMeetupMore: all.length > DISCOVER_MEETUP_PREVIEW,
            meetups: all.slice(0, DISCOVER_MEETUP_PREVIEW),
          });
        })
        .catch(function (err) {
          console.warn('[shouye] meetups', err);
          wx.showToast({ title: '约饭列表加载失败', icon: 'none' });
        });
    },

    /** 发现页：约饭、推荐、分类与后台管理端同一数据源 */
    loadDiscoverFromServer() {
      var self = this;
      this.loadMeetupsList();
      Promise.all([appContentApi.fetchRecommendSpots(), appContentApi.fetchDiscoverCategories()])
        .then(function (parts) {
          var recList = parts[0];
          var catList = parts[1];
          var patch = {};
          if (recList && recList.length) {
            patch.recommendations = recList.map(appContentApi.mapRecommendSpotToCard);
          }
          if (catList && catList.length) {
            patch.categories = [{ id: 'all', name: '全部' }].concat(
              catList.map(function (c) {
                return { id: 'dc-' + c.id, name: (c.name && String(c.name).trim()) || '' };
              }),
            );
          }
          if (Object.keys(patch).length) self.setData(patch);
        })
        .catch(function (err) {
          console.warn('[shouye] discover sync', err);
        });
    },

    onPullDownRefresh() {
      this.loadDiscoverFromServer();
      setTimeout(function () {
        wx.stopPullDownRefresh();
      }, 400);
    },

    onShow() {
      if (!appAuth.isLoggedIn()) {
        authGuard.redirectAuth('login');
        return;
      }
      this.loadDiscoverFromServer();
      this.startRecommendAutoplay();
    },

    onHide() {
      this.stopRecommendAutoplay();
    },

    onUnload() {
      this.stopRecommendAutoplay();
    },

    switchCategory(e) {
      const id = e.currentTarget.dataset.id;
      this.setData({ activeCategory: id });
    },

    onRecommendTap(e) {
      const id = e.currentTarget.dataset.id;
      if (id === undefined || id === null) return;
      wx.navigateTo({
        url: '/pages/shouye-recommend-detail/shouye-recommend-detail?id=' + id,
      });
    },

    onRecommendMoreTap() {
      wx.navigateTo({ url: '/pages/shouye-recommend-list/shouye-recommend-list' });
    },

    onMeetupMoreTap() {
      wx.navigateTo({ url: '/pages/shouye-meetup-list/shouye-meetup-list' });
    },

    onSearchTap() {
      wx.navigateTo({ url: '/pages/shouye-search/shouye-search' });
    },

    onMeetupTap(e) {
      const id = e.currentTarget.dataset.id;
      if (id === undefined || id === null) return;
      wx.navigateTo({
        url: '/pages/yuefan-detail/yuefan-detail?id=' + id,
      });
    },

    onRecommendSwiperChange(e) {
      const cur = e.detail && e.detail.current;
      if (typeof cur !== 'number' || cur < 0) return;
      this.setData({ recommendSwiperIndex: cur, recommendCurrent: cur });
      this.startRecommendAutoplay();
    },

    switchTab(e) {
      const tab = e.currentTarget.dataset.tab;
      if (!tab) return;
      const fromIdx = tabIndexById(this.data.tabs, this.data.activeTab);
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
      if (tab === 'discover') {
        this.setData({ activeTab: tab, activeTabIndex: 0, tabHighlightStyle: tabHighlightStyle(0) });
        return;
      }
      const idx = this.data.tabs.findIndex(function (t) {
        return t.id === tab;
      });
      if (idx < 0) return;
      this.setData({ activeTab: tab, activeTabIndex: idx, tabHighlightStyle: tabHighlightStyle(idx) });
    },
  })