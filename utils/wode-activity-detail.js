function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

var UPCOMING = {
  1: {
    id: 1,
    pool: 'upcoming',
    title: '香辣成都午餐',
    cover:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&auto=format&fit=crop&q=80',
    status: 'confirmed',
    statusText: '已确认',
    dateText: '2024年10月12日',
    timeText: '12:30 PM',
    venue: '海底捞火锅, CBD店',
    desc: '与几位同好一起涮一顿地道川味，聊聊城市里的辣味地图。已订包厢，欢迎准时到场。',
    hostName: '小辣椒',
    hostAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
    joined: 4,
    total: 6,
    faces: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&q=80',
    ],
    actionMode: 'detail',
  },
  2: {
    id: 2,
    pool: 'upcoming',
    title: '粤式早茶',
    cover:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&auto=format&fit=crop&q=80',
    status: 'pending',
    statusText: '待确认',
    dateText: '2024年10月14日',
    timeText: '10:00 AM',
    venue: '点都德, 天河店',
    desc: '周末早茶局，点心任点。发起人正在确认最终人数，请留意站内消息。',
    hostName: '阿茶',
    hostAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
    joined: 3,
    total: 6,
    faces: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80',
    ],
    actionMode: 'manage',
  },
};

var ENDED = {
  3: {
    id: 3,
    pool: 'ended',
    title: '周末露台烧烤',
    cover:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&auto=format&fit=crop&q=80',
    status: 'ended',
    statusText: '已结束',
    dateText: '2024年9月28日',
    timeText: '18:00',
    venue: '外滩某露台餐厅',
    desc: '夏末露台烧烤夜已圆满结束，感谢每一位到场的朋友。期待下次再聚！',
    hostName: '露台老王',
    hostAvatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80',
    joined: 8,
    total: 8,
    faces: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=80',
    ],
    actionMode: 'ended',
  },
};

function getWodeActivityDetail(id, pool) {
  var n = parseInt(id, 10);
  if (pool === 'ended') {
    if (!isNaN(n) && ENDED[n]) return clone(ENDED[n]);
    return clone(ENDED[3]);
  }
  if (!isNaN(n) && UPCOMING[n]) return clone(UPCOMING[n]);
  return clone(UPCOMING[1]);
}

module.exports = {
  getWodeActivityDetail: getWodeActivityDetail,
};
