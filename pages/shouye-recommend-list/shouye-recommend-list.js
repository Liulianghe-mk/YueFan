const appContentApi = require('../../utils/app-content-api.js');

Page({
  data: {
    list: [],
    loading: true,
  },

  onLoad() {
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
    return appContentApi
      .fetchRecommendSpots()
      .then(function (rows) {
        var list = Array.isArray(rows) ? rows.map(appContentApi.mapRecommendSpotToCard) : [];
        self.setData({ list: list, loading: false });
      })
      .catch(function (err) {
        console.warn('[shouye-recommend-list]', err);
        self.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      });
  },

  onItemTap(e) {
    var id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    wx.navigateTo({
      url: '/pages/shouye-recommend-detail/shouye-recommend-detail?id=' + id,
    });
  },
});
