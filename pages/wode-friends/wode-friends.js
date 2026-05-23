var followApi = require('../../utils/follow-api.js');

Page({
  data: {
    statusBarHeight: 20,
    friends: [],
  },

  onLoad() {
    var sh = 20;
    try {
      sh = wx.getWindowInfo().statusBarHeight || 20;
    } catch (e) {
      sh = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;
    }
    this.setData({ statusBarHeight: sh });
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  loadList() {
    var self = this;
    followApi
      .fetchFollowing()
      .then(function (list) {
        self.setData({ friends: list || [] });
      })
      .catch(function () {
        self.setData({ friends: [] });
      });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onFriendTap(e) {
    var id = e.currentTarget.dataset.id;
    if (id == null) return;
    wx.navigateTo({ url: '/pages/profile-detail/profile-detail?id=' + id });
  },
});
