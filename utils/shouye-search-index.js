/**
 * 发现页搜索索引（静态）。type: recommend -> 推荐详情；meetup -> 约饭详情。
 */
const INDEX = [
  {
    type: 'recommend',
    id: 1,
    title: '瑞穗寿司',
    subtitle: '日料 · 人均 ¥580',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDE9Cx3W-BI4zAI5z3h3AdDdpmDFsEZPBxu9U_TMIW1BhVVSBtVFwYx-QLHNnUFpYDU0imrpzT7HQoz7R9kX5vCLV4ljFMBiGl20yE8nTe1JQnIvfCiWnfl8DKzNH_gobDFlUkGelLlTRCZxDeiZYqiKAxuIDU6do8eZS4eQS6aW1C0-fndRG-yxdxGgjhlu7AbDhv-RmxxdHHInlkqKyC2obCeoSroTe9MAAm9VjxXHvBww9MiV_yaN7UUeh7ZI0VUc4gjJN7qGt5G',
    haystack: '瑞穗寿司 日料 精致餐饮 外滩 寿司',
  },
  {
    type: 'recommend',
    id: 2,
    title: 'Canvas 烘焙坊',
    subtitle: '咖啡馆 · 人均 ¥85',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZenKcM-NHbWtA5xXRGd1u5w3bjXSnpoeRO9GkwcVyi3K2xc9OZdET6-08slwLXDp71a4ae9JEmzGAmNkndVc8tN2BaQdqG4qQG99r4d1LRTliHMsydvsULvl7P2N0PDBMAoPkHV0WMEicGHgjGXqZ7gFt5jaxI5sny65QkY2UXwnmm4mCX21j6YacemYLwkbAYnddX6HlPhnyzQmVsVEvXg_52GDoD8anOn3uSszPqIh6cHB-BiEKWcUNigyAGlvE2gXkaw6fysY',
    haystack: 'canvas 烘焙 咖啡 安福路 面包',
  },
  {
    type: 'meetup',
    id: 1,
    title: '牛排馆午餐',
    subtitle: '附近的约饭 · 上海外滩',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    haystack: '牛排馆 午餐 外滩 牛排',
  },
  {
    type: 'meetup',
    id: 2,
    title: '老城厢早茶',
    subtitle: '附近的约饭 · 上海城隍庙',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5mro7dRtxplBgfAdHi9zXZYaRfgytpYpDIHUpigf8H-eZHL8DeUUT7r6ddvWez98yyRmjWgRf532pRlR4iWCMmfx0eSE6COV1yI6DX3KA2St6AIkEotz6RZNWVOSv0gpJZAGmRSkFsb-032YMj1rri_phtF04TilUz-_opiN2Kloo_STgtGe6sgmgkDMn3-ZbHRuG_AExbhkdtqWie9AGPato3A3oCMSh4Uh0SzxTl24lJQ7zmk9BNdPlOUXToLe2ns661qwAX0W5',
    haystack: '老城厢 早茶 城隍庙 豫园 本帮',
  },
  {
    type: 'meetup',
    id: 3,
    title: '周六寿司午饭',
    subtitle: '约饭 · 静安区 · 日本料理',
    cover:
      'https://images.unsplash.com/photo-1579584432223-c7ecc17ec883?w=900&auto=format&fit=crop&q=80',
    haystack: '周六 寿司 午饭 静安 日料 omakase',
  },
];

const HOT_TAGS = ['寿司', '外滩', '早茶', '咖啡', '静安', '日料'];

function filterDiscoverSearch(keyword) {
  var q = (keyword || '').trim();
  if (!q) {
    return { results: [], hotTags: HOT_TAGS, mode: 'hint' };
  }
  var lower = q.toLowerCase();
  var results = INDEX.filter(function (row) {
    var h = row.haystack + ' ' + row.title + ' ' + row.subtitle;
    if (h.indexOf(q) !== -1) return true;
    return h.toLowerCase().indexOf(lower) !== -1;
  }).map(function (row) {
    return {
      type: row.type,
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      cover: row.cover,
      badge: row.type === 'recommend' ? '店铺' : '约饭',
    };
  });
  return { results: results, hotTags: HOT_TAGS, mode: 'list' };
}

/**
 * 将后台「为你推荐 + 已发布约饭」转为搜索索引行（与 INDEX 项结构一致）。
 * @param {object[]} recommendDtos
 * @param {object[]} meetupDtos
 */
function buildSearchRowsFromApi(recommendDtos, meetupDtos) {
  var rows = [];
  (recommendDtos || []).forEach(function (dto) {
    if (!dto || String(dto.status || '').toUpperCase() !== 'PUBLISHED') return;
    var tags = (dto.tags && String(dto.tags)) || '';
    var price = dto.priceYuan != null ? dto.priceYuan : 0;
    var address = (dto.address && String(dto.address).trim()) || '';
    var hours = (dto.businessHours && String(dto.businessHours).trim()) || '';
    rows.push({
      type: 'recommend',
      id: dto.id,
      title: (dto.name && String(dto.name).trim()) || '',
      subtitle: (tags ? tags + ' · ' : '') + '人均 ¥' + price,
      cover: (dto.imageUrl && String(dto.imageUrl).trim()) || '',
      haystack:
        ((dto.name && String(dto.name)) || '') +
        ' ' +
        tags +
        ' ' +
        address +
        ' ' +
        hours +
        ' 推荐 店铺 人均 ' +
        price,
    });
  });
  (meetupDtos || []).forEach(function (dto) {
    if (!dto || dto.status !== 'PUBLISHED') return;
    rows.push({
      type: 'meetup',
      id: dto.id,
      title: (dto.title && String(dto.title).trim()) || '',
      subtitle: '附近的约饭 · ' + ((dto.locationLabel && String(dto.locationLabel).trim()) || ''),
      cover: (dto.coverUrl && String(dto.coverUrl).trim()) || '',
      haystack:
        ((dto.title && String(dto.title)) || '') +
        ' ' +
        (dto.locationLabel || '') +
        ' ' +
        (dto.timeLabel || '') +
        ' 约饭',
    });
  });
  return rows;
}

/**
 * @param {string} keyword
 * @param {object[]} indexRows buildSearchRowsFromApi 或 INDEX
 * @param {string[]} hotTagsList
 */
function filterDiscoverSearchWithRows(keyword, indexRows, hotTagsList) {
  var tags = hotTagsList && hotTagsList.length ? hotTagsList : HOT_TAGS;
  var q = (keyword || '').trim();
  if (!q) {
    return { results: [], hotTags: tags, mode: 'hint' };
  }
  var lower = q.toLowerCase();
  var list = indexRows && indexRows.length ? indexRows : INDEX;
  var results = list
    .filter(function (row) {
      var h = (row.haystack || '') + ' ' + (row.title || '') + ' ' + (row.subtitle || '');
      if (h.indexOf(q) !== -1) return true;
      return h.toLowerCase().indexOf(lower) !== -1;
    })
    .map(function (row) {
      return {
        type: row.type,
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        cover: row.cover,
        badge: row.type === 'recommend' ? '店铺' : '约饭',
      };
    });
  return { results: results, hotTags: tags, mode: 'list' };
}

module.exports = {
  filterDiscoverSearch: filterDiscoverSearch,
  filterDiscoverSearchWithRows: filterDiscoverSearchWithRows,
  buildSearchRowsFromApi: buildSearchRowsFromApi,
  HOT_TAGS: HOT_TAGS,
};
