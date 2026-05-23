const getPersonProfile = require('../../utils/person-profile.js').getPersonProfile;
const appContentApi = require('../../utils/app-content-api.js');
const chatNav = require('../../utils/chat-nav.js');
const followApi = require('../../utils/follow-api.js');

Page({
  data: {
    statusBarHeight: 20,
    profile: null,
    activeSub: 'posts',
    subTabs: [
      { id: 'posts', label: '动态' },
      { id: 'joined', label: '参加的' },
      { id: 'initiated', label: '发起的' },
    ],
    subList: [],
  },

  onLoad(options) {
    let sh = 20;
    try {
      sh = wx.getWindowInfo().statusBarHeight || 20;
    } catch (e) {
      sh = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;
    }
    const id = options.id || '1';
    const self = this;
    const n = parseInt(id, 10);
    function applyLocal() {
      const profile = getPersonProfile(id);
      self.setData({
        statusBarHeight: sh,
        profile: profile,
        activeSub: 'posts',
        subList: profile.tabPosts || [],
      });
    }
    if (!isNaN(n) && n > 0) {
      appContentApi
        .fetchInfluencerById(n)
        .then(function (dto) {
          if (dto) {
            const profile = appContentApi.mapInfluencerToProfile(dto);
            self.applyProfile(profile, sh);
            return;
          }
          applyLocal();
        })
        .catch(function () {
          applyLocal();
        });
    } else {
      applyLocal();
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  applyProfile(profile, sh) {
    var self = this;
    function show(prof) {
      self.setData({
        statusBarHeight: sh,
        profile: prof,
        activeSub: 'posts',
        subList: prof.tabPosts || [],
      });
    }
    if (!followApi.getApiBase()) {
      profile.followed = followApi.isFollowedLocal(profile.id);
      show(profile);
      return;
    }
    followApi
      .fetchFollowedInfluencerIds()
      .then(function (ids) {
        profile.followed = (ids || []).indexOf(Number(profile.id)) >= 0;
        show(profile);
      })
      .catch(function () {
        show(profile);
      });
  },

  onFollowTap() {
    const p = this.data.profile;
    if (!p) return;
    const next = !p.followed;
    const self = this;
    followApi
      .setFollow(p.id, next)
      .then(function () {
        self.setData({ profile: Object.assign({}, p, { followed: next }) });
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' });
      });
  },

  onMsgTap() {
    var p = this.data.profile;
    if (!p) return;
    chatNav.openChat({
      peerId: p.id,
      peerName: p.name,
      peerAvatar: p.avatar,
      greeting: '你好呀～有什么想聊的约饭计划吗？',
    });
  },

  onSubTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (!tab || !this.data.profile) return;
    var list = [];
    if (tab === 'posts') list = this.data.profile.tabPosts || [];
    else if (tab === 'joined') list = this.data.profile.tabJoined || [];
    else list = this.data.profile.tabInitiated || [];
    this.setData({ activeSub: tab, subList: list });
  },

  onSubItemTap() {
    wx.showToast({ title: '详情开发中', icon: 'none' });
  },
});
