const getWodeActivityDetail = require('../../utils/wode-activity-detail.js').getWodeActivityDetail;
const chatNav = require('../../utils/chat-nav.js');
const meetupsApi = require('../../utils/meetups-api.js');
const appContentApi = require('../../utils/app-content-api.js');
const userApi = require('../../utils/user-api.js');

var DEFAULT_COVER =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80';

Page({
  data: {
    act: null,
    meetupId: null,
    isManage: false,
    applications: [],
    processingId: null,
  },

  onLoad(options) {
    const id = options.id || '1';
    const pool = options.pool === 'ended' ? 'ended' : 'upcoming';
    const mode = options.mode === 'manage' ? 'manage' : '';
    this.setData({ meetupId: id, isManage: mode === 'manage' });
    this.loadDetail(id, pool, mode === 'manage');
  },

  loadDetail(id, pool, manageMode) {
    var self = this;
    if (!meetupsApi.getApiBase()) {
      self.setData({ act: getWodeActivityDetail(id, pool) });
      return;
    }
    Promise.all([
      appContentApi.fetchMeetupPublishedById(id),
      manageMode ? meetupsApi.fetchPendingApplications(id).catch(function () { return []; }) : Promise.resolve([]),
      meetupsApi.fetchMeetupMembers(id).catch(function () { return []; }),
    ])
      .then(function (parts) {
        var dto = parts[0];
        var apps = parts[1] || [];
        var members = parts[2] || [];
        if (!dto) {
          self.setData({ act: getWodeActivityDetail(id, pool) });
          return;
        }
        var faces = (members || [])
          .map(function (m) {
            return userApi.normalizeImageSrc(m.avatarUrl);
          })
          .slice(0, 6);
        var isHost = !!dto.isHost;
        var cardStatus = 'confirmed';
        if (isHost && apps.length) cardStatus = 'manage';
        else if (dto.myMembershipStatus === 'PENDING') cardStatus = 'pending';
        var act = {
          id: dto.id,
          title: (dto.title && String(dto.title).trim()) || '',
          venue: (dto.locationLabel && String(dto.locationLabel).trim()) || '',
          dateText: (dto.timeLabel && String(dto.timeLabel).trim()) || '',
          timeText: (dto.timeLabel && String(dto.timeLabel).trim()) || '',
          cover: userApi.normalizeImageSrc(dto.coverUrl, DEFAULT_COVER),
          hostName: (dto.hostName && String(dto.hostName).trim()) || '发起人',
          hostAvatar: userApi.normalizeImageSrc(dto.hostAvatarUrl),
          joined: dto.joinedCount != null ? Number(dto.joinedCount) : 0,
          total: dto.totalSlots != null ? Number(dto.totalSlots) : 0,
          faces: faces,
          desc:
            (dto.description && String(dto.description).trim()) ||
            '地点：' + ((dto.locationLabel && String(dto.locationLabel).trim()) || '—'),
          status: cardStatus,
          statusText:
            cardStatus === 'manage'
              ? apps.length + ' 人待审核'
              : cardStatus === 'pending'
                ? '待发起人审核'
                : '已确认',
          actionMode: isHost ? 'manage' : cardStatus === 'ended' ? 'ended' : 'detail',
        };
        var appRows = (apps || []).map(function (a) {
          return {
            id: a.id,
            nickname: (a.nickname && String(a.nickname).trim()) || '用户',
            avatarUrl: userApi.normalizeImageSrc(a.avatarUrl),
          };
        });
        self.setData({
          act: act,
          isManage: isHost,
          applications: appRows,
        });
      })
      .catch(function () {
        self.setData({ act: getWodeActivityDetail(id, pool) });
      });
  },

  onApprove(e) {
    var memberId = e.currentTarget.dataset.memberId;
    var meetupId = this.data.meetupId;
    if (!memberId || !meetupId) return;
    this.reviewApplication(meetupId, memberId, true);
  },

  onReject(e) {
    var memberId = e.currentTarget.dataset.memberId;
    var meetupId = this.data.meetupId;
    if (!memberId || !meetupId) return;
    this.reviewApplication(meetupId, memberId, false);
  },

  reviewApplication(meetupId, memberId, approve) {
    var self = this;
    if (this.data.processingId) return;
    this.setData({ processingId: memberId });
    var req = approve
      ? meetupsApi.approveApplication(meetupId, memberId)
      : meetupsApi.rejectApplication(meetupId, memberId);
    req
      .then(function () {
        wx.showToast({ title: approve ? '已通过' : '已拒绝', icon: 'success' });
        self.loadDetail(meetupId, 'upcoming', true);
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '操作失败', icon: 'none' });
      })
      .then(function () {
        self.setData({ processingId: null });
      });
  },

  onChat() {
    var act = this.data.act;
    if (!act) return;
    chatNav.openChat({
      peerName: act.hostName || '主理人',
      peerAvatar: act.hostAvatar,
      contextLabel: act.title ? '约饭 · ' + act.title : '约饭',
      greeting: '你好，关于「' + (act.title || '这场活动') + '」想跟你确认一下～',
    });
  },

  onPrimary() {
    const m = this.data.act && this.data.act.actionMode;
    if (m === 'manage') {
      return;
    }
    if (m === 'ended') {
      wx.showToast({ title: '查看回顾', icon: 'none' });
      return;
    }
    var id = this.data.meetupId;
    if (id) {
      wx.navigateTo({ url: '/pages/yuefan-detail/yuefan-detail?id=' + id });
      return;
    }
    wx.showToast({ title: '查看活动', icon: 'none' });
  },
});
