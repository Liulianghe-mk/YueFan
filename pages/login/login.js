const appAuth = require('../../utils/app-auth.js');
const userApi = require('../../utils/user-api.js');
const config = require('../../utils/config.js');
const authGuard = require('../../utils/auth-guard.js');

var USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;
var PWD_RE = /^[a-zA-Z0-9]{6,20}$/;

function getStatusBarHeight() {
  try {
    return (wx.getWindowInfo && wx.getWindowInfo().statusBarHeight) || 20;
  } catch (e) {
    try {
      return (wx.getSystemInfoSync && wx.getSystemInfoSync().statusBarHeight) || 20;
    } catch (e2) {
      return 20;
    }
  }
}

function defaultNicknameFromUsername(username) {
  var tail = username.length >= 4 ? username.slice(-4) : username;
  return '饭友' + tail;
}

Page({
  data: {
    mode: 'login',
    showEditOnly: false,
    accountRegistered: false,
    isRegisterPage: false,
    isAuthFormPage: false,
    statusBarHeight: 20,
    agreed: false,
    showPassword: false,
    submitLabel: '保存',
    submitting: false,
    showDevLogin: true,
    credentials: {
      username: '',
      password: '',
    },
    registerForm: {
      username: '',
      password: '',
    },
    avatarSrc: userApi.DEFAULT_AVATAR,
    form: {
      nickname: '',
      bio: '',
      avatar: userApi.DEFAULT_AVATAR,
    },
  },

  setAvatarSrc(src) {
    var raw = src == null ? '' : String(src).trim();
    var display = userApi.normalizeImageSrc(raw);
    this.setData({
      avatarSrc: display,
      'form.avatar': raw || display,
    });
  },

  onLoad(options) {
    var self = this;
    var isEdit = options.edit === '1';
    var openMode = options.mode === 'register' || isEdit ? 'register' : 'login';
    self._openMode = openMode;
    self._isEditProfile = isEdit;
    var showDev =
      !config.apiBase ||
      config.apiBase.indexOf('127.0.0.1') !== -1 ||
      config.apiBase.indexOf('localhost') !== -1;
    self.syncPageMode(openMode, isEdit, false);
    self.setData({
      statusBarHeight: getStatusBarHeight(),
      showDevLogin: showDev && !isEdit,
      submitLabel: isEdit ? '保存' : '保存',
    });
    if (appAuth.isLoggedIn()) {
      self.prefillFromServer();
    } else if (isEdit) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(function () {
        wx.navigateBack();
      }, 600);
    }
  },

  syncPageMode(mode, isEdit, accountRegistered) {
    var isRegisterPage = mode === 'register' && !isEdit && !accountRegistered;
    var isLoginPage = mode === 'login' && !isEdit && !accountRegistered;
    var isAuthFormPage = isRegisterPage || isLoginPage;
    this.setData({
      mode: mode,
      showEditOnly: isEdit,
      accountRegistered: accountRegistered,
      isRegisterPage: isRegisterPage,
      isAuthFormPage: isAuthFormPage,
    });
  },

  prefillFromServer() {
    var self = this;
    userApi
      .fetchMe()
      .then(function (dto) {
        if (!dto) return;
        var avatar = userApi.normalizeImageSrc(dto.avatarUrl);
        self.setData({
          avatarSrc: avatar,
          form: {
            nickname: (dto.nickname && String(dto.nickname).trim()) || '',
            bio: (dto.bio && String(dto.bio).trim()) || '',
            avatar: avatar,
          },
        });
        if (dto.profileComplete) {
          if (self._openMode === 'register' || self._isEditProfile) {
            return;
          }
          self.finishSuccess();
          return;
        }
        self.syncPageMode('register', self._isEditProfile, true);
      })
      .catch(function () {});
  },

  onNavBack() {
    if (this.data.isAuthFormPage) {
      var pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
        return;
      }
      if (this.data.isRegisterPage) {
        this.onSwitchMode({ currentTarget: { dataset: { mode: 'login' } } });
        return;
      }
      wx.reLaunch({ url: authGuard.HOME });
      return;
    }
    var stack = getCurrentPages();
    if (stack.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({ url: authGuard.HOME });
    }
  },

  onSwitchMode(e) {
    var mode = e.currentTarget.dataset.mode;
    if (!mode || mode === this.data.mode) return;
    this.syncPageMode(mode, this.data.showEditOnly, false);
    this.setData({ agreed: false, showPassword: false });
  },

  onToggleAgreed() {
    this.setData({ agreed: !this.data.agreed });
  },

  onTogglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  onLegalTap() {
    wx.showToast({ title: '协议页面开发中', icon: 'none' });
  },

  onLoginUsernameInput(e) {
    this.setData({ 'credentials.username': (e.detail && e.detail.value) || '' });
  },

  onPasswordInput(e) {
    this.setData({ 'credentials.password': (e.detail && e.detail.value) || '' });
  },

  onRegUsernameInput(e) {
    this.setData({ 'registerForm.username': (e.detail && e.detail.value) || '' });
  },

  onRegPasswordInput(e) {
    this.setData({ 'registerForm.password': (e.detail && e.detail.value) || '' });
  },

  onNicknameInput(e) {
    this.setData({ 'form.nickname': (e.detail && e.detail.value) || '' });
  },

  onBioInput(e) {
    this.setData({ 'form.bio': (e.detail && e.detail.value) || '' });
  },

  onChooseAvatar(e) {
    var detail = (e && e.detail) || {};
    var url = detail.avatarUrl;
    if (typeof url === 'string' && url.trim()) {
      this.setAvatarSrc(url.trim());
      return;
    }
    this.pickAvatarFromAlbum();
  },

  /** 开发者工具 / 部分基础库 chooseAvatar 异常时的降级 */
  pickAvatarFromAlbum() {
    var self = this;
    if (!wx.chooseMedia) {
      wx.showToast({ title: '当前环境不支持选图', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var files = res && res.tempFiles;
        var path = files && files[0] && files[0].tempFilePath;
        if (path) self.setAvatarSrc(path);
      },
    });
  },

  onAccountLogin() {
    var self = this;
    if (self.data.submitting) return;

    if (!self.data.agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    var username = (self.data.credentials.username || '').trim();
    var password = self.data.credentials.password || '';
    if (!USERNAME_RE.test(username)) {
      wx.showToast({ title: '账号为 3-32 位字母、数字或下划线', icon: 'none' });
      return;
    }
    if (!PWD_RE.test(password)) {
      wx.showToast({ title: '密码需 6-20 位字母或数字', icon: 'none' });
      return;
    }

    self.setData({ submitting: true });
    appAuth
      .loginWithAccount(username, password)
      .then(function () {
        return userApi.fetchMe();
      })
      .then(function (dto) {
        self.setData({ submitting: false });
        if (dto && dto.profileComplete) {
          self.finishSuccess();
          return;
        }
        var nick = (dto && dto.nickname) || '';
        var avatar = userApi.normalizeImageSrc(dto && dto.avatarUrl);
        self.setData({
          avatarSrc: avatar,
          form: {
            nickname: nick.indexOf('用户_') === 0 ? '' : nick,
            bio: (dto && dto.bio) || '',
            avatar: avatar,
          },
        });
        self.syncPageMode('register', false, true);
        wx.showToast({ title: '请完善资料', icon: 'none' });
      })
      .catch(function (err) {
        self.setData({ submitting: false });
        wx.showToast({
          title: (err && err.message) || '登录失败',
          icon: 'none',
        });
      });
  },

  onDevLogin() {
    var self = this;
    if (self.data.submitting) return;
    self.setData({ submitting: true });
    appAuth
      .loginWithCode('dev')
      .then(function () {
        return userApi.fetchMe();
      })
      .then(function (dto) {
        self.setData({ submitting: false });
        if (dto && dto.profileComplete) {
          self.finishSuccess();
          return;
        }
        self.syncPageMode('register', false, true);
        wx.showToast({ title: '请完善资料', icon: 'none' });
      })
      .catch(function (err) {
        self.setData({ submitting: false });
        wx.showToast({
          title: (err && err.message) || '登录失败',
          icon: 'none',
        });
      });
  },

  onRegisterSubmit() {
    var self = this;
    if (self.data.submitting) return;

    if (self._isEditProfile || self.data.accountRegistered) {
      var nick = (self.data.form.nickname || '').trim();
      if (nick.length < 2) {
        wx.showToast({ title: '昵称至少 2 个字', icon: 'none' });
        return;
      }
      self.submitProfileUpdate(nick);
      return;
    }

    if (!self.data.agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    var username = (self.data.registerForm.username || '').trim();
    var password = self.data.registerForm.password || '';
    if (!USERNAME_RE.test(username)) {
      wx.showToast({ title: '账号为 3-32 位字母、数字或下划线', icon: 'none' });
      return;
    }
    if (!PWD_RE.test(password)) {
      wx.showToast({ title: '密码需 6-20 位字母或数字', icon: 'none' });
      return;
    }

    self.setData({ submitting: true });
    appAuth
      .registerAccount({
        username: username,
        password: password,
        nickname: defaultNicknameFromUsername(username),
        avatarUrl: '',
        bio: '',
      })
      .then(function () {
        self.setData({ submitting: false });
        wx.showToast({ title: '注册成功', icon: 'success' });
        setTimeout(function () {
          self.finishSuccess();
        }, 400);
      })
      .catch(function (err) {
        self.setData({ submitting: false });
        wx.showToast({
          title: (err && err.message) || '注册失败',
          icon: 'none',
        });
      });
  },

  submitProfileUpdate(nick) {
    var self = this;
    self.setData({ submitting: true });
    var avatar = self.data.form.avatar || self.data.avatarSrc || '';
    userApi
      .updateMeWithAvatar({
        nickname: nick,
        avatarUrl: avatar,
        bio: (self.data.form.bio || '').trim(),
      })
      .then(function (dto) {
        var savedAvatar = userApi.resolveAvatarUrl(dto && dto.avatarUrl);
        self.setAvatarSrc(savedAvatar);
        self.setData({ submitting: false });
        wx.showToast({
          title: self._isEditProfile ? '已保存' : '资料已完善',
          icon: 'success',
        });
        setTimeout(function () {
          self.finishSuccess();
        }, 400);
      })
      .catch(function (err) {
        self.setData({ submitting: false });
        wx.showToast({
          title: (err && err.message) || '保存失败',
          icon: 'none',
        });
      });
  },

  finishSuccess() {
    if (this._isEditProfile) {
      var pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
        return;
      }
    }
    wx.reLaunch({ url: authGuard.HOME });
  },
});

