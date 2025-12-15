import { api } from '../../utils/api';
import lottie from 'lottie-miniprogram';
import Christmas_Tree from '../../lottie/Christmas_Tree.js';

Page({
  data: {
    dots: '...',
    timer: null as number | null
  },

  onReady() {
    this.createSelectorQuery().select('#lottie-canvas').node(res => {
      const canvas = res.node
      const context = canvas.getContext('2d')

      lottie.setup(canvas)

      lottie.loadAnimation({
        loop: true,
        autoplay: true,
        // animationData: Christmas_Tree, // 本地 JSON 路径

        path: 'https://p.qpaimg.com/uploads/wqDqXE.json',
        rendererSettings: {
          context,
        },
      })
    }).exec()
  },

  onLoad() {
    this.startPolling();
    this.animateDots();
  },

  onUnload() {
    this.stopPolling();
  },

  animateDots() {
    let count = 0;
    setInterval(() => {
      count = (count + 1) % 4;
      this.setData({
        dots: '.'.repeat(count)
      });
    }, 500);
  },

  startPolling() {
    // Poll every 5 minutes
    const timer = setInterval(async () => {
      try {
        const openid = wx.getStorageSync('openid');
        if (!openid) return; // Should return or handle error

        const res = await api.getUserEventStatus(openid);

        if (res && res.state === 'MATCHED') {
          this.stopPolling();
          let url = '';
          if (res.my_info && res.my_info.has_gift === 1) {
            url = `/pages/result/index?pair=${encodeURIComponent(JSON.stringify(res))}`;
          } else {
            url = `/pages/result/index?type=no_gift`;
          }

          wx.reLaunch({ url });
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 300000);

    this.setData({ timer });
  },

  stopPolling() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
});
