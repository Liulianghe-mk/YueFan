const getFeedPostDetail = require('../../utils/feed-post-detail.js').getFeedPostDetail;

const feedStore = require('../../utils/feed-store.js');

const appContentApi = require('../../utils/app-content-api.js');

const followApi = require('../../utils/follow-api.js');

const feedApi = require('../../utils/feed-api.js');



Page({

  data: {

    statusBarHeight: 20,

    post: null,

    postId: null,

    swiperCurrent: 0,

    imgTotal: 1,

    inputDraft: '',

    inputPlaceholder: '说点什么...',

    replyTarget: null,

    liking: false,

    sending: false,

    useApi: false,

  },



  onLoad(options) {

    let sh = 20;

    try {

      sh = wx.getWindowInfo().statusBarHeight || 20;

    } catch (e) {

      sh = (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;

    }

    const id = options.id;

    const self = this;

    this.setData({ postId: id, statusBarHeight: sh });



    function applyPost(post, useApi) {

      const imgs = post.images && post.images.length ? post.images : [''];

      self.setData({

        post: post,

        useApi: !!useApi,

        swiperCurrent: 0,

        imgTotal: imgs.length,

      });

      if (useApi && id) {

        self.loadCommentsFromApi(id);

      }

    }



    Promise.all([appContentApi.fetchFeedPostById(id), appContentApi.fetchInfluencers()])

      .then(function (parts) {

        var dto = parts[0];

        var influencers = parts[1] || [];

        if (dto) {

          var post = appContentApi.mapFeedPostToDetail(dto);

          var pid =

            dto.authorInfluencerId != null

              ? Number(dto.authorInfluencerId)

              : appContentApi.matchInfluencerProfileId(dto.authorName, influencers);

          post.authorProfileId = pid != null && !isNaN(pid) && pid > 0 ? pid : null;

          post.liked = dto.likedByMe === true;

          followApi

            .fetchFollowedInfluencerIds()

            .then(function (ids) {

              post.followed = (ids || []).indexOf(Number(post.authorProfileId)) >= 0;

              applyPost(post, true);

            })

            .catch(function () {

              applyPost(post, true);

            });

          return;

        }

        applyPost(getFeedPostDetail(id), false);

      })

      .catch(function () {

        applyPost(getFeedPostDetail(id), false);

      });

  },



  countComments(list) {
    var n = 0;
    (list || []).forEach(function (c) {
      n += 1;
      n += (c.replies || []).length;
    });
    return n;
  },

  loadCommentsFromApi(postId) {
    var self = this;
    feedApi.fetchComments(postId).then(function (list) {
      if (!list) return;
      var post = self.data.post;
      if (!post) return;
      self.setData({
        post: Object.assign({}, post, {
          commentList: list,
          comments: self.countComments(list),
        }),
      });
    });
  },



  onBack() {

    wx.navigateBack({ delta: 1 });

  },



  onSwiperChange(e) {

    this.setData({ swiperCurrent: e.detail.current });

  },



  onFollowTap() {

    const post = this.data.post;

    if (!post || post.authorProfileId == null) {

      wx.showToast({ title: '暂无法关注该用户', icon: 'none' });

      return;

    }

    const next = !post.followed;

    const self = this;

    followApi

      .setFollow(post.authorProfileId, next)

      .then(function () {

        self.setData({ post: Object.assign({}, post, { followed: next }) });

      })

      .catch(function (err) {

        wx.showToast({ title: (err && err.message) || '关注失败', icon: 'none' });

      });

  },



  onLikeTap() {

    var self = this;

    var post = this.data.post;

    var postId = this.data.postId;

    if (!post || !postId || this.data.liking) return;

    if (!this.data.useApi) {

      var nextLiked = !post.liked;

      var likes = post.likes + (nextLiked ? 1 : -1);

      if (likes < 0) likes = 0;

      self.setData({

        post: Object.assign({}, post, { liked: nextLiked, likes: likes }),

      });

      return;

    }

    this.setData({ liking: true });

    var req = post.liked ? feedApi.unlikePost(postId) : feedApi.likePost(postId);

    req

      .then(function (res) {

        if (!res) return;

        self.setData({

          post: Object.assign({}, self.data.post, {

            liked: res.likedByMe === true,

            likes: res.likesCount != null ? res.likesCount : self.data.post.likes,

          }),

        });

      })

      .catch(function (err) {

        wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' });

      })

      .finally(function () {

        self.setData({ liking: false });

      });

  },



  onReplyTap(e) {

    var id = e.currentTarget.dataset.id;

    var name = e.currentTarget.dataset.name || '';

    var parentId = e.currentTarget.dataset.parentId;

    if (parentId == null || parentId === '') parentId = id;

    this.setData({

      replyTarget: { commentId: id, parentId: parentId, authorName: name },

      inputPlaceholder: name ? '回复 @' + name : '说点什么...',

    });

  },



  onCancelReply() {

    this.setData({

      replyTarget: null,

      inputPlaceholder: '说点什么...',

    });

  },



  onEmojiTap() {

    wx.showToast({ title: '表情', icon: 'none' });

  },



  onInput(e) {

    this.setData({ inputDraft: e.detail.value });

  },



  onSend() {

    var self = this;

    var t = (this.data.inputDraft || '').trim();

    if (!t) {

      wx.showToast({ title: '请输入内容', icon: 'none' });

      return;

    }

    if (this.data.sending) return;



    if (!this.data.useApi) {

      wx.showToast({ title: '已发送', icon: 'success' });

      this.setData({ inputDraft: '', replyTarget: null, inputPlaceholder: '说点什么...' });

      return;

    }



    var postId = this.data.postId;

    var target = this.data.replyTarget;

    var parentId = target ? target.parentId : null;

    this.setData({ sending: true });

    feedApi

      .addComment(postId, t, parentId)

      .then(function () {

        self.setData({

          inputDraft: '',

          replyTarget: null,

          inputPlaceholder: '说点什么...',

        });

        self.loadCommentsFromApi(postId);

        return appContentApi.fetchFeedPostById(postId);

      })

      .then(function (dto) {

        if (!dto || !self.data.post) return;

        self.setData({

          post: Object.assign({}, self.data.post, {

            likes: dto.likesCount != null ? dto.likesCount : self.data.post.likes,

            comments: dto.commentsCount != null ? dto.commentsCount : self.data.post.comments,

          }),

        });

        wx.showToast({ title: '已发送', icon: 'success' });

      })

      .catch(function (err) {

        wx.showToast({ title: (err && err.message) || '发送失败', icon: 'none' });

      })

      .finally(function () {

        self.setData({ sending: false });

      });

  },



  onShareAppMessage() {

    const post = this.data.post;

    const id = post ? post.id : '';

    var imgs = post && post.images ? post.images : [];

    return {

      title: post ? post.authorName + '的动态' : '动态详情',

      path: '/pages/dongtai-detail/dongtai-detail?id=' + id,

      imageUrl: imgs.length ? imgs[0] : undefined,

    };

  },

});


