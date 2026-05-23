const searchIndex = require('../../utils/shouye-search-index.js');
const appContentApi = require('../../utils/app-content-api.js');

Page({
  data: {
    keyword: '',
    results: [],
    mode: 'hint',
    hotTags: searchIndex.HOT_TAGS,
    searchRows: [],
    inputFocus: true,
  },

  onLoad(options) {
    var self = this;
    var q = options.q ? decodeURIComponent(options.q) : '';
    this.refreshSearchIndex()
      .then(function () {
        if (q) {
          self.applyKeyword(q);
          self.setData({ inputFocus: false });
        }
      })
      .catch(function () {});
  },

  /** 热词、索引与后台管理端同步 */
  refreshSearchIndex() {
    var self = this;
    return Promise.all([
      appContentApi.fetchRecommendSpots(),
      appContentApi.fetchMeetupsPublished(),
      appContentApi.fetchHotSearchTags(),
    ])
      .then(function (parts) {
        var recs = parts[0] || [];
        var meets = parts[1] || [];
        var hots = parts[2] || [];
        var rows = searchIndex.buildSearchRowsFromApi(recs, meets);
        var labels = hots
          .map(function (h) {
            return h.label && String(h.label).trim();
          })
          .filter(Boolean);
        var hotTags = labels.length ? labels : searchIndex.HOT_TAGS;
        self.setData({ searchRows: rows, hotTags: hotTags });
        var kw = (self.data.keyword || '').trim();
        if (kw) {
          self.applyKeyword(self.data.keyword);
        } else {
          self.setData({
            results: [],
            mode: 'hint',
            hotTags: hotTags,
          });
        }
      })
      .catch(function (err) {
        console.warn('[shouye-search] sync', err);
      });
  },

  onPullDownRefresh() {
    this.refreshSearchIndex().finally(function () {
      wx.stopPullDownRefresh();
    });
  },

  applyKeyword(keyword) {
    var pack = searchIndex.filterDiscoverSearchWithRows(
      keyword,
      this.data.searchRows,
      this.data.hotTags,
    );
    var trimmed = (keyword || '').trim();
    this.setData({
      keyword: keyword,
      results: pack.results,
      mode: trimmed ? 'list' : 'hint',
      hotTags: pack.hotTags,
    });
  },

  onInput(e) {
    var v = e.detail.value || '';
    var pack = searchIndex.filterDiscoverSearchWithRows(v, this.data.searchRows, this.data.hotTags);
    this.setData({
      keyword: v,
      results: pack.results,
      mode: v.trim() ? 'list' : 'hint',
      hotTags: pack.hotTags,
    });
  },

  onClear() {
    this.setData({ keyword: '', results: [], mode: 'hint', inputFocus: true });
  },

  onHotTagTap(e) {
    var tag = e.currentTarget.dataset.tag;
    if (!tag) return;
    this.applyKeyword(tag);
    this.setData({ inputFocus: true });
  },

  onConfirm() {
    var k = (this.data.keyword || '').trim();
    if (!k) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }
    this.applyKeyword(k);
  },

  onResultTap(e) {
    var type = e.currentTarget.dataset.type;
    var id = e.currentTarget.dataset.id;
    if (id === undefined || id === null) return;
    if (type === 'recommend') {
      wx.navigateTo({
        url: '/pages/shouye-recommend-detail/shouye-recommend-detail?id=' + id,
      });
      return;
    }
    if (type === 'meetup') {
      wx.navigateTo({
        url: '/pages/yuefan-detail/yuefan-detail?id=' + id,
      });
    }
  },
});
