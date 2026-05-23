/**
 * 小程序端统一请求「与后台管理同一数据源」的接口（GET + 发起约饭 POST）。
 * 管理端保存后，小程序在 onShow / 下拉刷新时重新拉取即可同步。
 * 发起约饭 POST /api/app/meetups 无需登录，直接写入 meetup 表。
 */
var meetupsApi = require('./meetups-api.js');
var miniappUser = require('./miniapp-user.js');

function requestJson(path) {
  var base = meetupsApi.getApiBase();
  if (!base) return Promise.resolve(null);
  return new Promise(function (resolve, reject) {
    wx.request({
      url: base + path,
      method: 'GET',
      success: function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error('HTTP ' + res.statusCode));
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
}

function splitTags(tagsStr) {
  var s = (tagsStr && String(tagsStr).trim()) || '';
  if (!s) return [];
  return s
    .split(/[,，、\s]+/)
    .map(function (x) {
      return x.trim();
    })
    .filter(Boolean);
}

/** @returns {Promise<object[]|null>} */
function fetchRecommendSpots() {
  return requestJson('/api/app/recommend-spots');
}

/** @returns {Promise<object[]|null>} */
function fetchHotSearchTags() {
  return requestJson('/api/app/hot-tags');
}

/** @returns {Promise<object[]|null>} */
function fetchDiscoverCategories() {
  return requestJson('/api/app/discover-categories');
}

/** @returns {Promise<object[]|null>} */
function fetchFeedPosts() {
  return requestJson('/api/app/feed/posts');
}

/** @returns {Promise<object|null>} */
function fetchFeedPostById(id) {
  return requestJson('/api/app/feed/posts/' + encodeURIComponent(String(id)));
}

/** @returns {Promise<object[]|null>} */
function fetchMeetupsPublished() {
  return requestJson('/api/app/meetups');
}

/** @returns {Promise<object|null>} */
function fetchMeetupPublishedById(id) {
  return meetupsApi.fetchMeetupById(id);
}

/** @returns {Promise<object[]|null>} */
function fetchInfluencers() {
  return requestJson('/api/app/influencers');
}

/** @returns {Promise<object|null>} */
function fetchInfluencerById(id) {
  return requestJson('/api/app/influencers/' + encodeURIComponent(String(id)));
}

/** 发现页 swiper：与 shouye.wxml 字段一致 */
function mapRecommendSpotToCard(dto) {
  var tags = splitTags(dto.tags);
  return {
    id: dto.id,
    name: (dto.name && String(dto.name).trim()) || '',
    image: (dto.imageUrl && String(dto.imageUrl).trim()) || '',
    rating: dto.rating != null ? Number(dto.rating) : 0,
    tags: tags.length ? tags : ['推荐'],
    price: dto.priceYuan != null ? Number(dto.priceYuan) : 0,
  };
}

/** 推荐详情页：与 shouye-recommend-detail.wxml 对齐（无后台字段时用文案占位） */
function mapRecommendSpotToDetailItem(dto) {
  var tags = splitTags(dto.tags);
  var tagLine = tags.join('、');
  return {
    id: dto.id,
    name: (dto.name && String(dto.name).trim()) || '',
    image: (dto.imageUrl && String(dto.imageUrl).trim()) || '',
    rating: dto.rating != null ? Number(dto.rating) : 0,
    tags: tags.length ? tags : ['推荐'],
    price: dto.priceYuan != null ? Number(dto.priceYuan) : 0,
    address:
      (dto.address && String(dto.address).trim()) ||
      '地址待补充，可在管理端「为你推荐」中填写',
    hours:
      (dto.businessHours && String(dto.businessHours).trim()) ||
      '营业时间以门店当日公示为准',
    intro:
      (tagLine ? tagLine + ' · ' : '') +
      ((dto.name && String(dto.name).trim()) || '该推荐') +
      '。介绍与图片由管理端「为你推荐」同步，可在后台随时更新。',
    dishes: [
      {
        name: '门店推荐',
        desc: '更多菜品与套餐以店内菜单为准。',
      },
    ],
  };
}

/** 约饭详情：与 yuefan-detail.wxml 对齐；members 可选，来自 /members 接口 */
function mapMeetupDtoToDetail(dto, members) {
  var joined = Number(dto.joinedCount);
  if (isNaN(joined) || joined < 0) joined = 0;
  var total = Number(dto.totalSlots);
  if (isNaN(total) || total < 1) total = 1;
  var cover = (dto.coverUrl && String(dto.coverUrl).trim()) || '';
  var timeLabel = (dto.timeLabel && String(dto.timeLabel).trim()) || '—';
  var loc = (dto.locationLabel && String(dto.locationLabel).trim()) || '—';
  var avatars = [];
  var i;
  var memberList = Array.isArray(members) ? members : [];
  if (memberList.length) {
    for (i = 0; i < memberList.length && i < 12; i++) {
      var av = (memberList[i].avatarUrl && String(memberList[i].avatarUrl).trim()) || '';
      avatars.push(av || cover || '/images/tabbar/discover.svg');
    }
  } else {
    for (i = 0; i < joined && i < 12; i++) {
      avatars.push(cover || '/images/tabbar/discover.svg');
    }
  }
  var pendingByMe = dto.myMembershipStatus === 'PENDING';
  var joinedByMe = !!dto.joinedByMe;
  var canJoin = dto.canJoin === true && !pendingByMe;
  var needPh = Math.min(8, Math.max(0, total - joined));
  var placeholderIndexes = [];
  for (i = 0; i < needPh; i++) {
    placeholderIndexes.push(i);
  }
  return {
    categoryTag: '约饭',
    cover: cover,
    title: (dto.title && String(dto.title).trim()) || '',
    dateText: timeLabel,
    timeRange: timeLabel,
    priceText: '费用请与发起人确认',
    joined: joined,
    total: total,
    participantAvatars: avatars,
    placeholderIndexes: placeholderIndexes,
    organizerMessage: '「' + ((dto.title && String(dto.title).trim()) || '约饭') + '」地点：' + loc + '。数据来自管理端，已发布活动会同步到小程序列表。',
    organizer: {
      name: (dto.hostName && String(dto.hostName).trim()) || '发起人',
      verified: true,
      certifiedTag: (dto.hostBadge && String(dto.hostBadge).trim()) || '平台约饭',
      rating: (dto.hostRating && String(dto.hostRating).trim()) || '—',
      ratingCount: '—',
      eventsCount: 1,
      preference: '可在约饭 Tab 查看名额与状态。',
      avatar: (dto.hostAvatarUrl && String(dto.hostAvatarUrl).trim()) || cover || '/images/tabbar/discover.svg',
    },
    joinedByMe: joinedByMe,
    pendingByMe: pendingByMe,
    canJoin: canJoin,
    joinBtnTitle: joinedByMe
      ? '已加入'
      : pendingByMe
        ? '待审核'
        : canJoin
          ? dto.requireApproval
            ? '申请加入'
            : '立即加入'
          : '名额已满',
    joinBtnSub: joinedByMe
      ? '点击可取消'
      : pendingByMe
        ? '等待发起人通过'
        : canJoin
          ? '报名约饭'
          : '查看详情',
    address: loc,
    mapThumb: cover,
    latitude: undefined,
    longitude: undefined,
    nameForMap: (dto.title && String(dto.title).trim()) || '约饭地点',
    needMore: Math.max(0, total - joined),
  };
}

function defaultCommentList() {
  return [
    {
      id: 901,
      authorName: '食客 A',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
      timeText: '近期',
      content: '内容来自管理端动态，欢迎点赞与交流～',
    },
  ];
}

/** 动态详情：与 dongtai-detail 结构对齐 */
function mapFeedPostToDetail(dto) {
  var img = (dto.imageUrl && String(dto.imageUrl).trim()) || '';
  var imgs = img ? [img] : [''];
  return {
    id: dto.id,
    authorName: (dto.authorName && String(dto.authorName).trim()) || '',
    authorAvatar: (dto.authorAvatarUrl && String(dto.authorAvatarUrl).trim()) || '',
    timeText: (dto.timeText && String(dto.timeText).trim()) || '',
    followed: false,
    images: imgs,
    gatherBadge: (dto.gatherBadge && String(dto.gatherBadge).trim()) || '',
    location: (dto.locationLabel && String(dto.locationLabel).trim()) || '',
    content: (dto.content && String(dto.content).trim()) || '',
    likes: dto.likesCount != null ? Number(dto.likesCount) : 0,
    comments: dto.commentsCount != null ? Number(dto.commentsCount) : 0,
    shares: dto.sharesCount != null ? Number(dto.sharesCount) : 0,
    liked: dto.likedByMe === true,
    commentList: [],
  };
}

/** 动态列表卡片：与 dongtai.wxml 对齐 */
function mapFeedPostToListCard(dto, authorProfileId) {
  var img = (dto.imageUrl && String(dto.imageUrl).trim()) || '';
  var profileId =
    dto.authorInfluencerId != null
      ? Number(dto.authorInfluencerId)
      : authorProfileId != null
        ? Number(authorProfileId)
        : null;
  return {
    id: dto.id,
    authorName: (dto.authorName && String(dto.authorName).trim()) || '',
    authorAvatar: (dto.authorAvatarUrl && String(dto.authorAvatarUrl).trim()) || '',
    authorProfileId: profileId != null && !isNaN(profileId) && profileId > 0 ? profileId : null,
    timeText: (dto.timeText && String(dto.timeText).trim()) || '',
    followed: false,
    image: img,
    gatherBadge: (dto.gatherBadge && String(dto.gatherBadge).trim()) || '',
    location: (dto.locationLabel && String(dto.locationLabel).trim()) || '',
    content: (dto.content && String(dto.content).trim()) || '',
    likes: dto.likesCount != null ? Number(dto.likesCount) : 0,
    comments: dto.commentsCount != null ? Number(dto.commentsCount) : 0,
    shares: dto.sharesCount != null ? Number(dto.sharesCount) : 0,
    replyAvatars: [],
    replyExtra: 0,
    liked: dto.likedByMe === true,
    _fromApi: true,
  };
}

function matchInfluencerProfileId(authorName, influencers) {
  var name = (authorName && String(authorName).trim()) || '';
  if (!name || !influencers || !influencers.length) return null;
  var i;
  for (i = 0; i < influencers.length; i++) {
    var inf = influencers[i];
    var dn = (inf.displayName && String(inf.displayName).trim()) || '';
    if (dn && (dn === name || name.indexOf(dn) !== -1 || dn.indexOf(name) !== -1)) {
      return inf.id;
    }
  }
  return null;
}

/** 大V横向列表 */
function mapInfluencerToPopularHost(dto) {
  return {
    id: dto.id,
    name: (dto.displayName && String(dto.displayName).trim()) || '',
    avatar: (dto.avatarUrl && String(dto.avatarUrl).trim()) || '',
  };
}

/** 个人主页：与 profile-detail.wxml 对齐（后台无粉丝数等，用占位） */
function mapInfluencerToProfile(dto) {
  var badge = (dto.badgeLabel && String(dto.badgeLabel).trim()) || '';
  var rating = (dto.ratingText && String(dto.ratingText).trim()) || '—';
  return {
    id: dto.id,
    name: (dto.displayName && String(dto.displayName).trim()) || '',
    avatar: (dto.avatarUrl && String(dto.avatarUrl).trim()) || '',
    verified: true,
    followed: false,
    bio: (dto.bio && String(dto.bio).trim()) || '这位主理人的介绍由管理端同步。',
    fansText: '—',
    followingText: '—',
    scoreText: rating,
    mainTag: badge || '美食达人',
    badges: [{ icon: '⭐', label: rating !== '—' ? '评分 ' + rating : '平台达人' }],
    tabPosts: [],
    tabJoined: [],
    tabInitiated: [],
  };
}

/**
 * 发起约饭 POST /api/app/meetups，请求体与后端 MeetupAppCreateRequest 一致（camelCase）。
 * 后端已 permitAll，无需 Bearer；字段对应 meetup 表：title / location_label / time_label /
 * cover_url / total_slots / status（由 publicInvite 决定 PUBLISHED 或 DRAFT）。
 * @returns {Promise<object>} 创建后的 MeetupResponse
 */
function postMeetupCreate(base, body) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: base.replace(/\/$/, '') + '/api/app/meetups',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Miniapp-User': miniappUser.getOpenid(),
      },
      data: body,
      success: function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          var hint = '';
          if (res.data && res.data.message) hint = '：' + res.data.message;
          reject(new Error('HTTP ' + res.statusCode + hint));
          return;
        }
        var resp = res.data;
        if (!resp || resp.code !== 0) {
          reject(new Error((resp && resp.message) || '提交失败'));
          return;
        }
        resolve(resp.data);
      },
      fail: function (err) {
        reject(err && err.errMsg ? new Error(err.errMsg) : new Error('网络请求失败'));
      },
    });
  });
}

function createMeetupFromApp(body) {
  var base = meetupsApi.getApiBase();
  if (!base) {
    return Promise.reject(new Error('未配置 apiBase'));
  }
  return postMeetupCreate(base, body);
}

module.exports = {
  requestJson: requestJson,
  fetchRecommendSpots: fetchRecommendSpots,
  fetchHotSearchTags: fetchHotSearchTags,
  fetchDiscoverCategories: fetchDiscoverCategories,
  fetchFeedPosts: fetchFeedPosts,
  fetchFeedPostById: fetchFeedPostById,
  fetchMeetupsPublished: fetchMeetupsPublished,
  fetchMeetupPublishedById: fetchMeetupPublishedById,
  fetchInfluencers: fetchInfluencers,
  fetchInfluencerById: fetchInfluencerById,
  mapRecommendSpotToCard: mapRecommendSpotToCard,
  mapRecommendSpotToDetailItem: mapRecommendSpotToDetailItem,
  mapMeetupDtoToDetail: mapMeetupDtoToDetail,
  mapFeedPostToDetail: mapFeedPostToDetail,
  mapFeedPostToListCard: mapFeedPostToListCard,
  mapInfluencerToPopularHost: mapInfluencerToPopularHost,
  mapInfluencerToProfile: mapInfluencerToProfile,
  matchInfluencerProfileId: matchInfluencerProfileId,
  createMeetupFromApp: createMeetupFromApp,
};
