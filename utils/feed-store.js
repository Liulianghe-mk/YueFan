var STORAGE_KEY = 'feed_user_posts';

function getUserPosts() {
  try {
    var v = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function saveUserPosts(list) {
  try {
    wx.setStorageSync(STORAGE_KEY, list);
  } catch (e) {}
}

function prependPost(post) {
  var list = getUserPosts();
  list.unshift(post);
  saveUserPosts(list);
}

module.exports = {
  getUserPosts: getUserPosts,
  saveUserPosts: saveUserPosts,
  prependPost: prependPost,
};
