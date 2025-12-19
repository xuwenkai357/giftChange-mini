import { api } from '../../utils/api';
import lottie from 'lottie-miniprogram';
import Christmas_Tree from '../../lottie/Christmas_Tree.js';

Page({
  data: {
    dots: '...',
    timer: null as number | null
  },

  animation: null as any,

  onReady() {
    this.createSelectorQuery().select('#lottie-canvas').node(res => {
      const width = 600
      const height = 300

      const canvas = res.node
      const context = canvas.getContext('2d')

      // 设置 canvas 的宽度和高度，以适应不同设备的像素比
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.scale(dpr, dpr)

      lottie.setup(canvas)

      const animation = lottie.loadAnimation({
        loop: true,
        autoplay: true,
        animationData: Christmas_Tree, // 本地 JSON 路径
        // path: 'https://lottie.host/d4d69915-73a1-492b-a762-cfcaba84226d/LkSDJo0gAq.json',
        // path: 'https://p.qpaimg.com/uploads/wqDqXE.json',
        rendererSettings: {
          context,
        },
      })

      // 直接存储在 this 上，不要使用 setData（避免序列化复杂对象）
      this.animation = animation
    }).exec()
  },

  onLoad() {
    this.startPolling();
    this.animateDots();
  },

  onUnload() {
    this.stopPolling();
    if (this.animation) {
      this.animation.destroy();
    }
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
