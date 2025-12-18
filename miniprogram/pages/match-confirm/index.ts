import { api } from '../../utils/api';
import { PairItem, User } from '../../types/types';

interface PairGroup {
    pairCode: string;
    users: User[];
}

Page({
    data: {
        pairs: [] as PairItem[],
        groupA: [] as PairGroup[],
        groupB: [] as User[],
        submitting: false,
    },

    onLoad() {
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on('pairData', (data: { pairs: PairItem[], groupA: PairGroup[], groupB: User[] }) => {
            this.setData({
                pairs: data.pairs,
                groupA: data.groupA,
                groupB: data.groupB,
            });
        });
    },

    // 重新分配 - 返回上一页
    onRegenerate() {
        wx.navigateBack();
    },

    // 确认分配
    onConfirm() {
        if (this.data.pairs.length === 0) {
            wx.showToast({
                title: '没有配对数据',
                icon: 'none',
            });
            return;
        }

        wx.showModal({
            title: '确认分配',
            content: `确定要提交 ${this.data.pairs.length} 条配对信息吗？提交后将无法撤销。`,
            confirmColor: '#D42426',
            success: (res) => {
                if (res.confirm) {
                    this.submitPairs();
                }
            }
        });
    },

    submitPairs() {
        this.setData({ submitting: true });

        api.submitPairsToBackend({ pairs: this.data.pairs })
            .then(() => {
                wx.showToast({
                    title: '分配成功',
                    icon: 'success',
                });

                // 返回用户列表页并刷新
                setTimeout(() => {
                    wx.navigateBack({
                        success: () => {
                            // 通知上一页刷新数据
                            const pages = getCurrentPages();
                            const prevPage = pages[pages.length - 1];
                            if (prevPage && typeof prevPage.fetchUserList === 'function') {
                                prevPage.fetchUserList();
                            }
                        }
                    });
                }, 1500);
            })
            .catch((err: any) => {
                console.error('Submit pairs failed', err);
                wx.showModal({
                    title: '提交失败',
                    content: err.message || '请稍后重试',
                    showCancel: false,
                });
            })
            .finally(() => {
                this.setData({ submitting: false });
            });
    },
});
