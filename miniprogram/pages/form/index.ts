
import { api } from '../../utils/api';

Page({
  data: {
    callName: '',
    hasGift: true, // Default to true
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    loading: false
  },

  onLoad() {
    // Check if we already have user info stored (optional, but good UX)
  },

  async onChooseAvatar(e: any) {
    const { avatarUrl } = e.detail;

    // Immediate local preview
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });

    try {
      const openid = wx.getStorageSync('openid');
      if (!openid) {
        wx.showToast({ title: 'OpenID not found, cannot upload', icon: 'none' });
        return;
      }

      wx.showLoading({ title: 'Uploading...' });

      const fs = wx.getFileSystemManager();
      const base64 = fs.readFileSync(avatarUrl, 'base64');
      const base64Data = 'data:image/png;base64,' + base64;

      const remoteUrl = await api.uploadAvatar(openid, base64Data);

      this.setData({
        // 将http://替换为https://
        'userInfo.avatarUrl': remoteUrl.replace('http://', 'https://')
      });

      wx.showToast({ title: 'Uploaded', icon: 'success' });
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      wx.showToast({ title: 'Upload failed', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onNickNameChange(e: any) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
  },

  onCallNameInput(e: WechatMiniprogram.Input) {
    this.setData({
      callName: e.detail.value
    });
  },

  onGiftChange(e: WechatMiniprogram.RadioGroupChange) {
    this.setData({
      hasGift: e.detail.value === '1'
    });
  },

  async onSubmit() {
    const { callName, hasGift, userInfo } = this.data;

    if (!userInfo.avatarUrl) {
      wx.showToast({ title: '请设置头像', icon: 'none' });
      return;
    }

    if (!userInfo.nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }

    if (!callName.trim()) {
      wx.showToast({ title: '请输入希望的称呼', icon: 'none' });
      return;
    }

    try {
      this.setData({ loading: true });

      // Get OpenID (In real app, backend helper. Here simply mock or retrieve from storage if simulated)
      const openid = wx.getStorageSync('openid');
      if (!openid) throw new Error('OpenID not found');

      await api.submitRegistration({
        openid,
        wx_nickname: userInfo.nickName,
        preferred_name: callName,
        avatar_url: userInfo.avatarUrl,
        has_gift: hasGift ? 1 : 0
      });

      wx.showToast({ title: '提交成功', icon: 'success' });
      // Navigate to waiting page
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/waiting/index' });
      }, 1500);

    } catch (err: any) {
      console.error(err);
      const msg = err.errMsg || err.message || '提交出错';
      wx.showToast({ title: msg, icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
