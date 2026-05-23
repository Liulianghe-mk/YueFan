const meetupsApi = require('../../utils/meetups-api.js');

Page({
  data: {
    list: [],
    loading: true,
  },

  onLoad() {
    this.loadList();
  },

  onShow() {
    this.loadList();
  },

  onPullDownRefresh() {
    var self = this;
    this.loadList().finally(function () {
      wx.stopPullDownRefresh();
    });
  },

  loadList() {
    var self = this;
    self.setData({ loading: true });
    return meetupsApi
      .fetchPublishedMeetups({ page: 0, size: 50 })
      .then(function (res) {
        var list = res && res.shouyeMeetups ? res.shouyeMeetups : [];
        self.setData({ list: list, loading: false });
      })
      .catch(function (err) {
        console.warn('[shouye-meetup-list]', err);
        self.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onItemTap(e) {
    var id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    wx.navigateTo({
      url: '/pages/yuefan-detail/yuefan-detail?id=' + id,
    });
  },

  onGoYuefan() {
    wx.reLaunch({ url: '/pages/yuefan/yuefan?from=0' });
  },
});
