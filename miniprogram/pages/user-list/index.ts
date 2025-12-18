import { api } from '../../utils/api';
import { User, PairItem } from '../../types/types';

// 用于展示的配对分组信息
interface PairGroup {
  pairCode: string;
  users: User[];
}

// 生成配对结果
interface GeneratePairsResult {
  pairs: PairItem[];
  groupA: PairGroup[];  // 带礼物配对组
  groupB: User[];       // 无礼物用户
}

Page({
  data: {
    userList: [] as User[],
    loading: true,
    generating: false,
  },

  onLoad() {
    this.fetchUserList();
  },

  fetchUserList() {
    this.setData({ loading: true });
    api.getUserList()
      .then(({ list }) => {
        // 创建用户ID映射，用于快速查找配对对象
        const userMap = new Map<string, User>();
        list.forEach(user => {
          userMap.set(user.id, user);
        });

        const processedList = list.map(user => {
          // 查找配对对象信息
          let matched_user_info = null;
          if (user.matched_target_id && user.matched_target_id !== '0') {
            const matchedUser = userMap.get(user.matched_target_id);
            if (matchedUser) {
              matched_user_info = {
                wx_nickname: matchedUser.wx_nickname,
                preferred_name: matchedUser.preferred_name,
                avatar_url: matchedUser.avatar_url,
              };
            }
          }

          return {
            ...user,
            display_status: this.getStatusText(user.match_status),
            display_gift: user.has_gift === 1 ? '已带礼物' : '未带礼物',
            is_matched: user.match_status === 'MATCHED',
            matched_user_info, // 配对对象的信息
          };
        });

        const noGiftCount = list.filter(user => user.has_gift === 0).length;
        const giftCount = list.filter(user => user.has_gift === 1).length;
        const totalCount = list.length;

        this.setData({
          userList: processedList,
          totalCount,
          giftCount,
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

  // 生成匹配信息
  onGenerateMatch() {
    this.setData({ generating: true });

    // 重新获取最新用户列表
    api.getUserList()
      .then(({ list }) => {
        // 筛选带礼物且未配对的用户
        const giftPendingUsers = list.filter(
          user => user.has_gift === 1 && user.match_status !== 'MATCHED'
        );

        // 筛选无礼物且未配对的用户
        const noGiftPendingUsers = list.filter(
          user => user.has_gift === 0 && user.match_status !== 'MATCHED'
        );

        const giftCount = giftPendingUsers.length;

        // 判断逻辑
        if (giftCount === 0 && noGiftPendingUsers.length === 0) {
          wx.showModal({
            title: '提示',
            content: '没有需要配对的用户',
            showCancel: false,
          });
          this.setData({ generating: false });
          return;
        }

        if (giftCount > 0 && giftCount % 2 !== 0) {
          // 奇数，无法配对
          wx.showModal({
            title: '无法配对',
            content: `带礼物的用户人数为奇数 (${giftCount}人)，无法两两配对。请调整后重试。`,
            showCancel: false,
          });
          this.setData({ generating: false });
          return;
        }

        // 偶数或0，生成配对信息
        const result = this.generatePairs(giftPendingUsers, noGiftPendingUsers);

        // 验证配对结果
        const validation = this.validatePairs(result.pairs);
        if (!validation.valid) {
          wx.showModal({
            title: '配对异常',
            content: validation.error || '生成配对时出现错误，请重试',
            showCancel: false,
          });
          this.setData({ generating: false });
          return;
        }

        // 跳转到确认页面
        wx.navigateTo({
          url: '/pages/match-confirm/index',
          success: (res) => {
            res.eventChannel.emit('pairData', {
              pairs: result.pairs,
              groupA: result.groupA,
              groupB: result.groupB,
            });
          },
          complete: () => {
            this.setData({ generating: false });
          }
        });
      })
      .catch((err: any) => {
        console.error('Failed to fetch user list for matching', err);
        this.setData({ generating: false });
        wx.showToast({
          title: '获取用户列表失败',
          icon: 'none',
        });
      });
  },

  // 生成配对算法
  generatePairs(giftUsers: User[], noGiftUsers: User[]): GeneratePairsResult {
    const pairs: PairItem[] = [];
    const groupA: PairGroup[] = [];

    // 随机打乱带礼物用户顺序
    const shuffled = [...giftUsers].sort(() => Math.random() - 0.5);

    // 两两配对生成 A 组
    for (let i = 0; i < shuffled.length; i += 2) {
      const groupNum = Math.floor(i / 2) + 1;
      const pairCode = `A${groupNum}`;
      const user1 = shuffled[i];
      const user2 = shuffled[i + 1];

      pairs.push({
        id: Number(user1.id),
        matched_target_id: Number(user2.id),
        pair_code: pairCode
      });
      pairs.push({
        id: Number(user2.id),
        matched_target_id: Number(user1.id),
        pair_code: pairCode
      });

      groupA.push({
        pairCode,
        users: [user1, user2]
      });
    }

    // 无礼物用户分配到 B 组
    const groupB = noGiftUsers;
    noGiftUsers.forEach(user => {
      pairs.push({
        id: Number(user.id),
        matched_target_id: 0,
        pair_code: 'B'
      });
    });

    return { pairs, groupA, groupB };
  },

  // 验证配对结果
  validatePairs(pairs: PairItem[]): { valid: boolean; error?: string } {
    const idSet = new Set<number>();
    for (const pair of pairs) {
      if (idSet.has(pair.id)) {
        return { valid: false, error: `用户 ID ${pair.id} 被重复分配` };
      }
      idSet.add(pair.id);
    }
    return { valid: true };
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
