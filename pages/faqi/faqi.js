const tabNav = require('../../utils/tab-nav.js');
const tabIndexById = tabNav.tabIndexById;
const parseFromQuery = tabNav.parseFromQuery;
const tabHighlightStyle = tabNav.tabHighlightStyle;
const meetupsApi = require('../../utils/meetups-api.js');
const appContentApi = require('../../utils/app-content-api.js');
const authGuard = require('../../utils/auth-guard.js');
const appAuth = require('../../utils/app-auth.js');

function formatDateCN(y, m, d) {
  return y + '年' + m + '月' + d + '日';
}

/** meetup.title：主题 + 可选补充 + 审核备注，总长 ≤ 200 */
function buildMeetupTitle(theme, description, requireApproval) {
  var t = (theme || '').trim();
  if (!t) return '';
  var bits = [t];
  var desc = (description || '').trim();
  if (desc) bits.push(desc);
  if (requireApproval) bits.push('（需审核）');
  var s = bits.join(' ');
  return s.length <= 200 ? s : s.slice(0, 200);
}

function buildLocationLabel(hasRestaurant, restaurant, searchKeyword, locationManual) {
  if (hasRestaurant && restaurant && (restaurant.name || '').trim()) {
    var line = (restaurant.name || '').trim();
    var kw = (searchKeyword || '').trim();
    if (kw) line += ' · ' + kw;
    return line.slice(0, 255);
  }
  return ((locationManual || searchKeyword || '').trim()).slice(0, 255);
}

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
    apiHint: '',
    searchKeyword: '',
    hasRestaurant: false,
    restaurant: {
      name: '',
      meta: '',
      image: '',
    },
    suggestSpots: [],
    locationManual: '',
    dateValue: '',
    dateDisplay: '',
    timeValue: '12:00',
    minPeople: 2,
    maxPeople: 6,
    peopleBadge: '2 - 6 人',
    publicInvite: true,
    requireApproval: false,
    theme: '',
    description: '',
    submitting: false,
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
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const pad = function (n) {
      return n < 10 ? '0' + n : '' + n;
    };
    const dateValue = y + '-' + pad(m) + '-' + pad(d);
    const hint = meetupsApi.getApiBase() ? '' : '未配置 apiBase 时无法提交到后端，请在 utils/config.js 中填写服务地址';
    this.setData({
      statusBarHeight: sh,
      activeTabIndex: from,
      activeTab: fromId,
      tabHighlightStyle: tabHighlightStyle(from),
      dateValue: dateValue,
      dateDisplay: formatDateCN(String(y), m, d),
      apiHint: hint,
    });
    const createIdx = 2;
    if (from !== createIdx || fromId !== tabs[createIdx].id) {
      const self = this;
      setTimeout(function () {
        self.setData({
          activeTabIndex: createIdx,
          activeTab: tabs[createIdx].id,
          tabHighlightStyle: tabHighlightStyle(createIdx),
        });
      }, 20);
    }
    this.loadSuggestSpots();
  },

  onShow() {
    if (!appAuth.isLoggedIn()) {
      authGuard.redirectAuth('login');
      return;
    }
    this.loadSuggestSpots();
  },

  loadSuggestSpots() {
    var self = this;
    appContentApi.fetchRecommendSpots().then(function (list) {
      if (!list || !list.length) return;
      var rows = list
        .filter(function (x) {
          return x && String(x.status || '').toUpperCase() === 'PUBLISHED';
        })
        .map(function (dto) {
          var tags = (dto.tags && String(dto.tags).trim()) || '';
          return {
            id: dto.id,
            name: (dto.name && String(dto.name).trim()) || '',
            image: (dto.imageUrl && String(dto.imageUrl).trim()) || '',
            meta: tags || '推荐好店',
          };
        });
      self.setData({ suggestSpots: rows.slice(0, 12) });
    });
  },

  onPickSuggest(e) {
    var id = Number(e.currentTarget.dataset.id);
    var list = this.data.suggestSpots || [];
    var row = list.find(function (r) {
      return r.id === id;
    });
    if (!row) return;
    this.setData({
      hasRestaurant: true,
      searchKeyword: '',
      locationManual: '',
      restaurant: {
        name: row.name,
        meta: row.meta,
        image: row.image,
      },
    });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onLocationManual(e) {
    this.setData({ locationManual: e.detail.value });
  },

  clearRestaurant() {
    this.setData({
      hasRestaurant: false,
      restaurant: { name: '', meta: '', image: '' },
    });
  },

  onDateChange(e) {
    const v = e.detail.value;
    const parts = v.split('-');
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    this.setData({
      dateValue: v,
      dateDisplay: formatDateCN(y, m, d),
    });
  },

  onTimeChange(e) {
    this.setData({ timeValue: e.detail.value });
  },

  onMaxPeopleChange(e) {
    const v = Number(e.detail.value);
    const max = isNaN(v) ? 6 : Math.min(30, Math.max(2, v));
    const min = this.data.minPeople;
    this.setData({
      maxPeople: max,
      peopleBadge: min + ' - ' + max + ' 人',
    });
  },

  onPublicChange(e) {
    this.setData({ publicInvite: !!e.detail.value });
  },

  onApprovalChange(e) {
    this.setData({ requireApproval: !!e.detail.value });
  },

  onThemeInput(e) {
    this.setData({ theme: e.detail.value });
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  onPublish() {
    var self = this;
    if (this.data.submitting) return;
    var theme = (this.data.theme || '').trim();
    if (!theme) {
      wx.showToast({ title: '请填写约饭主题', icon: 'none' });
      return;
    }
    var loc = buildLocationLabel(
      this.data.hasRestaurant,
      this.data.restaurant,
      this.data.searchKeyword,
      this.data.locationManual,
    );
    if (!loc) {
      wx.showToast({ title: '请选择推荐餐厅或填写地点', icon: 'none' });
      return;
    }
    var timeLabel = (this.data.dateDisplay + ' ' + this.data.timeValue).trim().slice(0, 120);
    var title = buildMeetupTitle(theme, this.data.description, this.data.requireApproval);
    var cover = '';
    if (this.data.hasRestaurant && this.data.restaurant && (this.data.restaurant.image || '').trim()) {
      cover = this.data.restaurant.image.trim();
    }
    var maxP = Number(this.data.maxPeople);
    if (isNaN(maxP) || maxP < 2) maxP = 2;
    if (maxP > 30) maxP = 30;
    /** 与后端 MeetupAppCreateRequest / meetup 表字段一一对应 */
    var body = {
      title: title,
      locationLabel: loc,
      timeLabel: timeLabel,
      coverUrl: cover,
      totalSlots: maxP,
      publicInvite: !!this.data.publicInvite,
      requireApproval: !!this.data.requireApproval,
    };
    if (!meetupsApi.getApiBase()) {
      wx.showModal({
        title: '无法提交',
        content: '请先在 utils/config.js 配置 apiBase 并启动后端服务。',
        showCancel: false,
      });
      return;
    }
    this.setData({ submitting: true });
    appContentApi
      .createMeetupFromApp(body)
      .then(function (row) {
        var published = row && row.status === 'PUBLISHED';
        wx.showToast({
          title: published ? '发布成功' : '已存草稿',
          icon: 'success',
        });
        setTimeout(function () {
          if (published && row && row.id != null) {
            wx.navigateTo({
              url: '/pages/yuefan-detail/yuefan-detail?id=' + row.id,
            });
            return;
          }
          wx.reLaunch({ url: '/pages/yuefan/yuefan?from=2' });
        }, 450);
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : '提交失败';
        wx.showModal({ title: '发布失败', content: msg, showCancel: false });
      })
      .then(function () {
        self.setData({ submitting: false });
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
});
