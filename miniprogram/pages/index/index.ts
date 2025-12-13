import { api } from '../../utils/api';

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
      // 1. Check for stored openid
      let openid = wx.getStorageSync('openid');
      if (!openid) {
        // If openid is missing (maybe onLaunch hasn't finished or failed),
        // we might need to prompt user or wait.
        // For now, assume it should be there.
        const res = await wx.getStorage({ key: 'openid' }).catch(() => ({ data: '' }));
        if (res.data) openid = res.data;
        else throw new Error('OpenID not found. Please wait or restart.');
      }

      // 2. Check Status
      const res = await api.getUserEventStatus(openid);

      if (res) {
        const { state, my_info } = res;

        let url = '/pages/form/index';

        if (state === 'UNREGISTERED') {
          url = '/pages/form/index';
        } else if (state === 'PENDING') {
          url = '/pages/waiting/index';
        } else if (state === 'MATCHED') {
          if (my_info && my_info.has_gift === 1) {
            // Pass partner info to result page
            url = `/pages/result/index?pair=${encodeURIComponent(JSON.stringify(res))}`;
          } else {
            // No gift, show special hint (or handle in result page via type param)
            url = `/pages/result/index?type=no_gift`;
          }
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
