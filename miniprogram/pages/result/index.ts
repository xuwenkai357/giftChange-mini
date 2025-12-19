import { UserEventStatusResponse } from '../../types/types';

Page({
  data: {
    pairInfo: null as any,
    isNoGift: false,
    showGift: false,
    // Animation phases: '' -> 'collide' -> 'bounce-back' -> 'final'
    animationPhase: '',
    // Gift phases: '' -> 'throw-up' -> 'fall-down' -> 'swing'
    giftPhase: ''
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
          }
        };

        this.setData({ pairInfo });

        // Start the multi-phase animation sequence
        this.startAnimationSequence();

      } catch (e) {
        console.error('Failed to parse pair info', e);
        wx.showToast({ title: '配对信息错误', icon: 'none' });
      }
    }
  },

  /**
   * Multi-phase animation sequence:
   * 1. Avatars slide in and collide in the center (600ms)
   * 2. Gift is thrown up from collision point (start at collision, 800ms)
   * 3. Avatars bounce back to final positions (500ms, starts with gift throw)
   * 4. Gift falls down (600ms)
   * 5. Gift swings left and right (infinite loop)
   * 6. Show user info and footer
   */
  startAnimationSequence() {
    // Phase 1: Collide (600ms)
    setTimeout(() => {
      this.setData({ animationPhase: 'collide' });
    }, 300);

    // Phase 2: At collision moment - throw gift up + bounce back avatars
    setTimeout(() => {
      this.setData({
        animationPhase: 'bounce-back',
        giftPhase: 'throw-up'
      });
    }, 900); // 300 + 600 = collision complete

    // Phase 3: Gift falls down
    setTimeout(() => {
      this.setData({ giftPhase: 'fall-down' });
    }, 1700); // 900 + 800 = throw up complete

    // Phase 4: Gift starts swinging + show final state
    setTimeout(() => {
      this.setData({
        animationPhase: 'final',
        giftPhase: 'swing',
        showGift: true
      });
    }, 2300); // 1700 + 600 = fall down complete
  },

  onShareAppMessage() {
    return {
      title: '我找到了我的圣诞礼物交换伙伴！',
      path: '/pages/index/index'
    };
  }
});
