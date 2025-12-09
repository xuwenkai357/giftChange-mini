import { PairInfo } from '../../types/types';

Page({
    data: {
        pairInfo: null as PairInfo | null,
        animationStarted: false,
        showGift: false
    },

    onLoad(options: { pair: string }) {
        if (options.pair) {
            try {
                const pairInfo = JSON.parse(decodeURIComponent(options.pair));
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
