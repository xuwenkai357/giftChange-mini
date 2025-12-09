import { mockApi } from '../../utils/mock';

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

    onChooseAvatar(e: any) {
        const { avatarUrl } = e.detail;
        this.setData({
            'userInfo.avatarUrl': avatarUrl
        });
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

            const formData = {
                openid,
                avatarUrl: userInfo.avatarUrl,
                nickName: userInfo.nickName,
                callName,
                hasGift
            };

            const res = await mockApi.submitForm(formData);

            if (res.code === 0) {
                wx.showToast({ title: '提交成功', icon: 'success' });
                // Navigate to waiting page
                setTimeout(() => {
                    wx.reLaunch({ url: '/pages/waiting/index' });
                }, 1500);
            } else {
                wx.showToast({ title: res.msg || '提交失败', icon: 'none' });
            }

        } catch (err: any) {
            console.error(err);
            wx.showToast({ title: '提交出错', icon: 'none' });
        } finally {
            this.setData({ loading: false });
        }
    }
});
