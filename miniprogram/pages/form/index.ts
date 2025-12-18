
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
    loading: false,
    focus: false,
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
        wx.showToast({ title: 'OpenId获取失败', icon: 'none' });
        return;
      }

      wx.showLoading({ title: '上传中...' });

      const fs = wx.getFileSystemManager();
      const base64 = fs.readFileSync(avatarUrl, 'base64');
      const base64Data = 'data:image/png;base64,' + base64;

      const remoteUrl = await api.uploadAvatar(openid, base64Data);

      this.setData({
        // 将http://替换为https://
        'userInfo.avatarUrl': remoteUrl.replace('http://', 'https://')
      });

      wx.showToast({ title: '上传成功', icon: 'success' });
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      wx.showToast({ title: '上传失败', icon: 'none' });
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
      if (!openid) throw new Error('OpenID获取失败');

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
  },
  handleTouchInput() {
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: res => {
          console.log('用户同意了隐私协议 或 无需用户同意隐私协议')
          // 用户同意隐私协议后给昵称input聚焦
          this.setData({
            focus: true
          })
        },
        fail: res => {
          console.log('用户拒绝了隐私协议')
        }
      })
    } else {
      this.setData({
        focus: true
      })
    }
  },
});
