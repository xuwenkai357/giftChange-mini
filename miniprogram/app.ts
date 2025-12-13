import { api } from './utils/api'

App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: async res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        try {
          if (res.code) {
            const data = await api.getWeixinInfo(res.code);
            if (data && data.openid) {
              console.log('Got openid:', data.openid);
              wx.setStorageSync('openid', data.openid);
            }
          }
        } catch (e) {
          console.error('Login failed to get openid', e);
        }
      },
    })
  },
})