var apiBase = require('./api-base.js');
var miniappUser = require('./miniapp-user.js');
var appAuth = require('./app-auth.js');
var userApi = require('./user-api.js');

var DEFAULT_COVER =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80';

function getApiBase() {
  return apiBase.getApiBase();
}

function joinLabel(a, b) {
  var x = (a || '').trim();
  var y = (b || '').trim();
  if (x && y) return x + ' · ' + y;
  return x || y || '';
}

function appHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Miniapp-User': miniappUser.getOpenid(),
  };
}

function requestWithUser(method, path, data) {
  var base = getApiBase();
  if (!base) return Promise.resolve(null);
  return appAuth.ensureAppAccessToken().then(function (token) {
    var headers = appHeaders();
    if (token) headers.Authorization = 'Bearer ' + token;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: base + path,
        method: method,
        header: headers,
        data: data,
        success: function (res) {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error((res.data && res.data.message) || 'HTTP ' + res.statusCode));
            return;
          }
          var body = res.data;
          if (!body || body.code !== 0) {
            reject(new Error((body && body.message) || '接口返回异常'));
            return;
          }
          resolve(body.data);
        },
        fail: function (err) {
          reject(err && err.errMsg ? new Error(err.errMsg) : new Error('网络请求失败'));
        },
      });
    });
  });
}

/**
 * 后端 MeetupDto（camelCase）→ 约饭 Tab 列表卡片 yuefan.wxml
 */
function mapToYuefanCard(dto) {
  var joined = Number(dto.joinedCount);
  if (isNaN(joined) || joined < 0) joined = 0;
  var total = Number(dto.totalSlots);
  if (isNaN(total) || total < 1) total = 1;
  var pending = dto.myMembershipStatus === 'PENDING';
  var approved = !!dto.joinedByMe;
  var open =
    dto.canJoin === true ||
    (dto.status === 'PUBLISHED' && joined < total && !approved && !pending);
  var desc = (dto.description && String(dto.description).trim()) || joinLabel(dto.locationLabel, dto.timeLabel);
  return {
    id: dto.id,
    cover: userApi.normalizeImageSrc(dto.coverUrl, DEFAULT_COVER),
    joined: joined,
    total: total,
    tag: (dto.categoryTag && String(dto.categoryTag).trim()) || '约饭',
    distance: (dto.distanceLabel && String(dto.distanceLabel).trim()) || '',
    district: (dto.district && String(dto.district).trim()) || '',
    title: (dto.title && String(dto.title).trim()) || '',
    desc: desc,
    hostName: (dto.hostName && String(dto.hostName).trim()) || '东道主',
    hostAvatar: userApi.normalizeImageSrc(dto.hostAvatarUrl),
    hostRating:
      dto.hostRating !== undefined && dto.hostRating !== null && String(dto.hostRating).trim() !== ''
        ? String(dto.hostRating).trim()
        : '—',
    hostBadge: (dto.hostBadge && String(dto.hostBadge).trim()) || '',
    joinedByMe: approved,
    pendingByMe: pending,
    canJoin: open,
  };
}

/**
 * 后端 MeetupDto → 发现页「附近的约饭」shouye.wxml
 */
function mapToShouyeMeetup(dto) {
  var joined = Number(dto.joinedCount);
  if (isNaN(joined) || joined < 0) joined = 0;
  var total = Number(dto.totalSlots);
  if (isNaN(total) || total < 1) total = 1;
  var published = dto.status === 'PUBLISHED';
  var open =
    dto.canJoin === true ||
    (published && joined < total && dto.joinedByMe !== true);
  var badge = (dto.hostBadge && String(dto.hostBadge)) || '';
  var verified = badge.indexOf('认证') !== -1;
  var location =
    (dto.locationLabel && String(dto.locationLabel).trim()) || joinLabel(dto.district, dto.distanceLabel) || '—';
  return {
    id: dto.id,
    title: (dto.title && String(dto.title).trim()) || '',
    location: location,
    time: (dto.timeLabel && String(dto.timeLabel).trim()) || '—',
    joined: joined,
    total: total,
    hostAvatar: userApi.normalizeImageSrc(
      dto.hostAvatarUrl || dto.coverUrl,
    ),
    verified: verified,
    badgeActive: open,
    ctaPrimary: open,
    ctaLabel: dto.joinedByMe ? '已加入' : open ? '加入' : '查看',
    joinedByMe: !!dto.joinedByMe,
    canJoin: open,
  };
}

/**
 * @param {{ page?: number, size?: number }} opts
 * @returns {Promise<null | { yuefanEvents: object[], shouyeMeetups: object[] }>}
 */
function fetchPublishedMeetups(opts) {
  var base = getApiBase();
  if (!base) return Promise.resolve(null);
  return requestWithUser('GET', '/api/app/meetups')
    .then(function (data) {
      var list = Array.isArray(data) ? data : [];
      var published = list.filter(function (x) {
        return x && x.status === 'PUBLISHED';
      });
      return {
        yuefanEvents: published.map(mapToYuefanCard),
        shouyeMeetups: published.map(mapToShouyeMeetup),
      };
    })
    .catch(function (err) {
      return Promise.reject(err);
    });
}

function fetchMeetupById(id) {
  return requestWithUser('GET', '/api/app/meetups/' + encodeURIComponent(String(id)));
}

function fetchMeetupMembers(id) {
  return requestWithUser('GET', '/api/app/meetups/' + encodeURIComponent(String(id)) + '/members');
}

function joinMeetup(id) {
  return requestWithUser('POST', '/api/app/meetups/' + encodeURIComponent(String(id)) + '/join');
}

function leaveMeetup(id) {
  return requestWithUser('DELETE', '/api/app/meetups/' + encodeURIComponent(String(id)) + '/join');
}

function fetchMyActivities() {
  return requestWithUser('GET', '/api/app/my/activities');
}

function fetchPendingApplications(meetupId) {
  return requestWithUser('GET', '/api/app/my/meetups/' + encodeURIComponent(String(meetupId)) + '/applications');
}

function approveApplication(meetupId, memberId) {
  return requestWithUser(
    'POST',
    '/api/app/my/meetups/' +
      encodeURIComponent(String(meetupId)) +
      '/applications/' +
      encodeURIComponent(String(memberId)) +
      '/approve',
  );
}

function rejectApplication(meetupId, memberId) {
  return requestWithUser(
    'POST',
    '/api/app/my/meetups/' +
      encodeURIComponent(String(meetupId)) +
      '/applications/' +
      encodeURIComponent(String(memberId)) +
      '/reject',
  );
}

/** 后端 MyActivityItem → 我的页卡片 */
function mapMyActivityToWodeCard(item) {
  if (!item) return null;
  var time = (item.timeLabel && String(item.timeLabel).trim()) || '';
  var shortTime = time.length > 16 ? time.slice(-8) : time;
  return {
    id: item.meetupId,
    month: item.monthLabel || '—',
    day: item.dayLabel || '—',
    status: item.cardStatus || 'confirmed',
    title: (item.title && String(item.title).trim()) || '',
    venue: (item.venue && String(item.venue).trim()) || '',
    time: shortTime || '—',
    cover: userApi.normalizeImageSrc(item.coverUrl, DEFAULT_COVER),
    faces: [],
    action: item.action || 'detail',
    pendingApplicantCount: item.pendingApplicantCount != null ? Number(item.pendingApplicantCount) : 0,
    isHost: !!item.isHost,
  };
}

module.exports = {
  getApiBase: getApiBase,
  fetchPublishedMeetups: fetchPublishedMeetups,
  fetchMeetupById: fetchMeetupById,
  fetchMeetupMembers: fetchMeetupMembers,
  joinMeetup: joinMeetup,
  leaveMeetup: leaveMeetup,
  fetchMyActivities: fetchMyActivities,
  fetchPendingApplications: fetchPendingApplications,
  approveApplication: approveApplication,
  rejectApplication: rejectApplication,
  mapToYuefanCard: mapToYuefanCard,
  mapToShouyeMeetup: mapToShouyeMeetup,
  mapMyActivityToWodeCard: mapMyActivityToWodeCard,
};
