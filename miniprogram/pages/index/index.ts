import { mockApi } from '../../utils/mock';

Page({
  data: {
    loading: false
  },

  onLoad() {
    // Optional: Auto check on load
  },

  async onStart() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      // 1. Login
      const loginRes = await wx.login();
      if (!loginRes.code) {
        throw new Error('Login failed');
      }

      // Simulate getting openid and persistence
      let openid = wx.getStorageSync('openid');
      if (!openid) {
        openid = 'mock_openid_' + Math.floor(Math.random() * 10000);
        wx.setStorageSync('openid', openid);
      }

      // 2. Check Status
      const res = await mockApi.checkStatus(openid);

      if (res.code === 0) {
        const { isSubmitted, isPaired } = res.data;

        let url = '/pages/form/index';
        if (isPaired) {
          // Fetch pair info to pass to result
          const pairRes = await mockApi.getPairInfo(openid);
          if (pairRes.data) {
            url = `/pages/result/index?pair=${encodeURIComponent(JSON.stringify(pairRes.data))}`;
          } else {
            // Fallback if data missing
            url = '/pages/waiting/index';
          }
        } else if (isSubmitted) {
          url = '/pages/waiting/index';
        }

        wx.navigateTo({ url });
      }

    } catch (e) {
      console.error(e);
      wx.showToast({ title: '系统繁忙，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
