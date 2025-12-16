import { api } from '../../utils/api';
import { User } from '../../types/types';

Page({
  data: {
    userList: [] as User[],
    loading: true,
  },

  onLoad() {
    this.fetchUserList();
  },

  fetchUserList() {
    this.setData({ loading: true });
    api.getUserList()
      .then(({ list }) => {
        const processedList = list.map(user => ({
          ...user,
          display_status: this.getStatusText(user.match_status),
          display_gift: user.has_gift === 1 ? '已带礼物' : '未带礼物',
          is_matched: user.match_status === 'MATCHED'
        }));

        const noGiftCount = list.filter(user => user.has_gift === 0).length;

        this.setData({
          userList: processedList,
          noGiftCount,
          loading: false,
        });
      })
      .catch((err: any) => {
        console.error('Failed to fetch user list', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none',
        });
      });
  },

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'UNREGISTERED': '未注册',
      'PENDING': '待匹配',
      'MATCHED': '已匹配'
    };
    return statusMap[status] || status;
  },

  onDelete(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index;
    const user = this.data.userList[index];

    if (!user || !user.id) {
      wx.showToast({ title: '错误: 缺少用户ID', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${user.wx_nickname} 的报名吗？此操作不可撤销。`,
      confirmColor: '#E64340',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中' });
          api.deleteRegistration(user.id)
            .then(() => {
              wx.hideLoading();
              wx.showToast({ title: '删除成功' });
              this.fetchUserList();
            })
            .catch(err => {
              wx.hideLoading();
              wx.showToast({ title: '删除失败', icon: 'none' });
              console.error('Delete error:', err);
            });
        }
      }
    });
  },
});
