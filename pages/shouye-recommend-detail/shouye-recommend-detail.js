const { getShouyeRecommendDetail } = require('../../utils/shouye-recommend-detail.js');
const appContentApi = require('../../utils/app-content-api.js');

Page({
  data: {
    item: null,
  },

  onLoad(options) {
    const id = options.id;
    const self = this;
    appContentApi
      .fetchRecommendSpots()
      .then(function (list) {
        if (list && list.length) {
          var n = Number(id);
          var dto = list.find(function (x) {
            return x && Number(x.id) === n;
          });
          if (dto) {
            self.setData({ item: appContentApi.mapRecommendSpotToDetailItem(dto) });
            return;
          }
        }
        self.setData({ item: getShouyeRecommendDetail(id) });
      })
      .catch(function () {
        self.setData({ item: getShouyeRecommendDetail(id) });
      });
  },

  onReserve() {
    wx.showToast({ title: '预约功能开发中', icon: 'none' });
  },
});
