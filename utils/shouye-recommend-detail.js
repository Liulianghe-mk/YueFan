/**
 * 首页「为你推荐」详情（饭店 + 食品介绍），与 pages/shouye/shouye.js 中 recommendations.id 对齐。
 */
const DETAIL = {
  1: {
    id: 1,
    name: '瑞穗寿司',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDE9Cx3W-BI4zAI5z3h3AdDdpmDFsEZPBxu9U_TMIW1BhVVSBtVFwYx-QLHNnUFpYDU0imrpzT7HQoz7R9kX5vCLV4ljFMBiGl20yE8nTe1JQnIvfCiWnfl8DKzNH_gobDFlUkGelLlTRCZxDeiZYqiKAxuIDU6do8eZS4eQS6aW1C0-fndRG-yxdxGgjhlu7AbDhv-RmxxdHHInlkqKyC2obCeoSroTe9MAAm9VjxXHvBww9MiV_yaN7UUeh7ZI0VUc4gjJN7qGt5G',
    rating: 4.9,
    tags: ['日料', '精致餐饮'],
    price: 580,
    address: '上海市黄浦区外滩金融中心 B1-08',
    hours: '11:30–14:00，17:30–22:00',
    intro:
      '瑞穗寿司专注江户前寿司与季节鱼获，板前座位可近距离观看师傅捏制。店内选用日本进口醋米与当日空运海产，环境安静适合商务小聚与纪念日用餐。',
    dishes: [
      {
        name: '特上握寿司八贯',
        desc: '金枪鱼大腹、海胆、牡丹虾等八贯组合，突出鱼脂与醋饭平衡。',
      },
      { name: '炙烧和牛卷', desc: '薄切和牛轻炙，搭配山葵与自制酱汁，口感温润。' },
      { name: '季节刺身五点', desc: '随渔汛更换品种，呈现当季鲜味。' },
    ],
  },
  2: {
    id: 2,
    name: 'Canvas 烘焙坊',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZenKcM-NHbWtA5xXRGd1u5w3bjXSnpoeRO9GkwcVyi3K2xc9OZdET6-08slwLXDp71a4ae9JEmzGAmNkndVc8tN2BaQdqG4qQG99r4d1LRTliHMsydvsULvl7P2N0PDBMAoPkHV0WMEicGHgjGXqZ7gFt5jaxI5sny65QkY2UXwnmm4mCX21j6YacemYLwkbAYnddX6HlPhnyzQmVsVEvXg_52GDoD8anOn3uSszPqIh6cHB-BiEKWcUNigyAGlvE2gXkaw6fysY',
    rating: 4.7,
    tags: ['咖啡馆', '生活方式'],
    price: 85,
    address: '上海市徐汇区安福路 322 号 1 层',
    hours: '08:00–20:00',
    intro:
      'Canvas 以酸种面包与手冲咖啡为主，烘焙间开放可视，强调本地面粉与当季食材。空间明亮，适合早餐、下午茶与轻办公。',
    dishes: [
      { name: '酸种可颂', desc: '48 小时低温发酵，外皮酥脆、内里蜂窝分明。' },
      { name: '季节水果挞', desc: '卡士达与当季莓果，甜度克制。' },
      { name: '埃塞俄比亚耶加雪菲', desc: '花香与柑橘调性，中浅焙手冲。' },
    ],
  },
};

function getShouyeRecommendDetail(id) {
  const n = Number(id);
  const row = DETAIL[n];
  if (row) return JSON.parse(JSON.stringify(row));
  return JSON.parse(JSON.stringify(DETAIL[1]));
}

module.exports = {
  getShouyeRecommendDetail,
};
