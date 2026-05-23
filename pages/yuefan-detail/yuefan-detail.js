const getMeetDetail = require('../../utils/meet-detail.js').getMeetDetail;

const appContentApi = require('../../utils/app-content-api.js');

const meetupsApi = require('../../utils/meetups-api.js');

const chatNav = require('../../utils/chat-nav.js');



Page({

  data: {

    meetupId: null,

    detail: null,

    placeholderIndexes: [],

    joining: false,

  },



  onLoad(options) {

    const self = this;

    const id = options.id;

    this.setData({ meetupId: id });

    this.loadDetail(id);

  },



  loadDetail(id) {

    const self = this;

    function apply(d) {

      self.setData({

        detail: d,

        placeholderIndexes: d.placeholderIndexes || [],

      });

    }

    if (!meetupsApi.getApiBase()) {

      apply(getMeetDetail(id));

      return;

    }

    Promise.all([

      appContentApi.fetchMeetupPublishedById(id),

      meetupsApi.fetchMeetupMembers(id).catch(function () {

        return [];

      }),

    ])

      .then(function (parts) {

        var dto = parts[0];

        var members = parts[1];

        if (dto) {

          apply(appContentApi.mapMeetupDtoToDetail(dto, members));

          return;

        }

        apply(getMeetDetail(id));

      })

      .catch(function () {

        apply(getMeetDetail(id));

      });

  },



  onOpenMap() {

    const d = this.data.detail;

    if (!d || d.latitude === undefined) {

      wx.showToast({ title: '暂无坐标', icon: 'none' });

      return;

    }

    wx.openLocation({

      latitude: d.latitude,

      longitude: d.longitude,

      name: d.nameForMap || '地点',

      address: d.address,

      scale: 16,

      fail: function () {

        wx.showToast({ title: '无法打开地图', icon: 'none' });

      },

    });

  },



  onOrganizerMore() {

    wx.showToast({ title: '发起人主页', icon: 'none' });

  },



  onPrivateChat() {

    var d = this.data.detail;

    if (!d || !d.organizer) {

      wx.showToast({ title: '暂无发起人信息', icon: 'none' });

      return;

    }

    var org = d.organizer;

    chatNav.openChat({

      peerName: org.name || '发起人',

      peerAvatar: org.avatar,

      contextLabel: d.title ? '约饭 · ' + d.title : '约饭',

      greeting: '你好，我对这场约饭很感兴趣，想了解一下详情～',

    });

  },



  onJoinNow() {

    var self = this;

    var id = this.data.meetupId;

    var d = this.data.detail;

    if (!id || !d) return;

    if (!meetupsApi.getApiBase()) {

      wx.showToast({ title: '未连接后端', icon: 'none' });

      return;

    }

    if (this.data.joining) return;



    if (d.joinedByMe || d.pendingByMe) {

      wx.showModal({

        title: d.pendingByMe ? '取消申请' : '取消报名',

        content: d.pendingByMe ? '确定撤回报名申请？' : '确定退出这场约饭？',

        success: function (res) {

          if (!res.confirm) return;

          self.setData({ joining: true });

          meetupsApi

            .leaveMeetup(id)

            .then(function () {

              wx.showToast({ title: '已取消报名', icon: 'none' });

              self.loadDetail(id);

            })

            .catch(function (err) {

              wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' });

            })

            .then(function () {

              self.setData({ joining: false });

            });

        },

      });

      return;

    }



    if (!d.canJoin) {

      wx.showToast({ title: '名额已满或未开放', icon: 'none' });

      return;

    }



    this.setData({ joining: true });

    meetupsApi

      .joinMeetup(id)

      .then(function (res) {

        var msg = '加入成功';
        if (res && res.pendingApproval) msg = '已提交申请，等待发起人审核';
        else if (res && res.alreadyJoined && res.meetup && res.meetup.myMembershipStatus === 'PENDING') {
          msg = '您已申请，等待审核';
        } else if (res && res.alreadyJoined) msg = '您已加入';
        wx.showToast({ title: msg, icon: 'success' });
        self.loadDetail(id);

      })

      .catch(function (err) {

        wx.showToast({ title: (err && err.message) || '加入失败', icon: 'none' });

      })

      .then(function () {

        self.setData({ joining: false });

      });

  },

});


