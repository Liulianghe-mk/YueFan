/** 与当前选中 tab id 一致的下标，用于 reLaunch 的 ?from=（高亮起点 = 当前图标） */
function tabIndexById(tabs, id) {
  const i = tabs.findIndex(function (t) {
    return t.id === id;
  });
  return i < 0 ? 0 : i;
}

/** 解析路由上的 from，并限制在合法范围 */
function parseFromQuery(options, maxIdx) {
  let from = 0;
  if (options && options.from !== undefined && options.from !== '') {
    const n = parseInt(options.from, 10);
    if (!isNaN(n)) from = n;
  }
  if (from < 0) from = 0;
  if (from > maxIdx) from = maxIdx;
  return from;
}

/** 底部 Tab 高亮条 transform（避免 WXML 内 style 写 {{}} 触发 IDE/CSS 误报） */
function tabHighlightStyle(index) {
  var i = Number(index);
  if (isNaN(i)) i = 0;
  return 'transform: translate3d(' + i * 100 + '%, 0, 0);';
}

module.exports = {
  tabIndexById: tabIndexById,
  parseFromQuery: parseFromQuery,
  tabHighlightStyle: tabHighlightStyle,
};
