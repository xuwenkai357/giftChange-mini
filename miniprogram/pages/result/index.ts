import { UserEventStatusResponse } from '../../types/types';

Page({
  data: {
    pairInfo: null as any,
    isNoGift: false,
    animationStarted: false,
    showGift: false
  },

  onLoad(options: { pair?: string, type?: string }) {
    if (options.type === 'no_gift') {
      this.setData({ isNoGift: true, showGift: true });
      return;
    }

    if (options.pair) {
      try {
        const res = JSON.parse(decodeURIComponent(options.pair)) as UserEventStatusResponse;

        // Map to UI structure
        const pairInfo = {
          user1: {
            name: res.my_info?.wx_nickname || '我',
            avatar: res.my_info?.avatar_url || '',
            hasGift: res.my_info?.has_gift === 1
          },
          user2: {
            name: res.partner_info?.preferred_name || 'Mystery Reindeer',
            avatar: res.partner_info?.avatar_url || '',
            // Partner gift status unknown/irrelevant for this view
          }
        };

        this.setData({ pairInfo });

        // Start animation after a short delay
        setTimeout(() => {
          this.setData({ animationStarted: true });

          // Show gift result after collision animation
          setTimeout(() => {
            this.setData({ showGift: true });
          }, 2000);
        }, 500);

      } catch (e) {
        console.error('Failed to parse pair info', e);
        wx.showToast({ title: '配对信息错误', icon: 'none' });
      }
    }
  },

  onShareAppMessage() {
    return {
      title: '我找到了我的圣诞礼物交换伙伴！',
      path: '/pages/index/index'
    };
  }
});
