var feedStore = require('../../utils/feed-store.js');
var userApi = require('../../utils/user-api.js');

var DEFAULT_COVER =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80';

var ME_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80';

Page({
  data: {
    content: '',
    imagePath: '',
    localImagePath: '',
    location: '',
    gatherBadge: '',
    publishing: false,
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value });
  },

  onGatherInput(e) {
    this.setData({ gatherBadge: e.detail.value });
  },

  chooseImage() {
    var self = this;
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: function (res) {
          var f = res.tempFiles && res.tempFiles[0];
          if (f && f.tempFilePath) {
            self.setData({
              imagePath: userApi.normalizeImageSrc(f.tempFilePath),
              localImagePath: f.tempFilePath,
            });
          }
        },
      });
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var p = res.tempFilePaths && res.tempFilePaths[0];
        if (p) {
          self.setData({
            imagePath: userApi.normalizeImageSrc(p),
            localImagePath: p,
          });
        }
      },
    });
  },

  clearImage() {
    this.setData({ imagePath: '', localImagePath: '' });
  },

  onPublish() {
    if (this.data.publishing) return;
    var text = (this.data.content || '').trim();
    if (!text) {
      wx.showToast({ title: '请填写动态正文', icon: 'none' });
      return;
    }
    var loc = (this.data.location || '').trim();
    var badge = (this.data.gatherBadge || '').trim();
    var post = {
      id: Date.now(),
      authorName: '我',
      authorAvatar: ME_AVATAR,
      timeText: '刚刚',
      followed: false,
      image: this.data.imagePath || DEFAULT_COVER,
      gatherBadge: badge || '1人已聚',
      location: loc || '未填写地点',
      content: text,
      likes: 0,
      comments: 0,
      shares: 0,
      replyAvatars: [],
      replyExtra: 0,
      authorProfileId: 99,
    };
    this.setData({ publishing: true });
    feedStore.prependPost(post);
    wx.showToast({ title: '发布成功', icon: 'success' });
    var self = this;
    setTimeout(function () {
      self.setData({ publishing: false });
      wx.navigateBack({ delta: 1 });
    }, 600);
  },
});
