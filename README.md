# giftChange
你需要为微信小程序项目实现圣诞节礼物交换配对功能，项目基于TypeScript + Less模板开发。请严格遵循以下要求完成开发：

### 功能实现步骤
1. **用户登录与状态检查**
   - 调用wx.login获取openid
   - 接口检查`openid + 今日日期`是否已提交表单（Mock接口返回示例：{isSubmitted: boolean}）
   - 根据检查结果跳转至表单页或等待页

2. **表单提交页面**
   - 获取微信头像、昵称（通过wx.getUserProfile）
   - 表单字段：
     - 希望对方称呼（输入框）
     - 是否携带礼物（单选按钮组：是/否）
   - 提交时携带openid（Mock接口参数：{openid, avatarUrl, nickName, callName, hasGift: boolean}）

3. **等待配对页面**
   - 添加圣诞主题动画（如飘落的雪花、闪烁的圣诞树轮廓）
   - 轮询调用配对查询接口（Mock接口返回示例：{pairInfo?: {user1: {avatar, nickName, callName, hasGift}, user2: {...}} | null}）
   - 无配对信息时显示"等待礼物交换配对生成"

4. **配对成功页面**
   - 显示碰撞动画：双方头像逐渐靠近并生成礼物图标
   - 展示内容：
     - 双方头像、微信昵称、希望称呼
     - 若用户未携带礼物，显示"请到后方接待人员处领取礼物"
   - 动画效果要求流畅自然，符合圣诞氛围

5. **UI设计规范**
   - 整体风格：充满圣诞元素（如红色/绿色主色调、雪花、圣诞树、铃铛、礼物盒等）
   - 禁止出现圣诞老人形象
   - 动画效果需适配小程序性能，避免过度渲染

### 技术要求
1. **TypeScript接口定义**
   - 为所有接口请求/响应、表单数据、配对信息创建interface
   - 添加详细注释说明字段含义
   - 示例格式：
     ```typescript
     /** 用户表单提交数据 */
     interface FormData {
       openid: string; // 用户唯一标识
       avatarUrl: string; // 微信头像地址
       nickName: string; // 微信昵称
       callName: string; // 希望对方称呼
       hasGift: boolean; // 是否携带礼物
     }
     ```

2. **Mock数据实现**
   - 模拟接口返回不同状态（未提交/已提交/配对成功/配对中）
   - 模拟用户数据（至少包含5组不同的用户信息）

3. **Less样式开发**
   - 使用变量定义圣诞主题色（如@christmasRed: #E63946; @christmasGreen: #2A9D8F）
   - 动画效果使用CSS3 @keyframes实现
   - 适配不同屏幕尺寸（rpx单位）

### 输出要求
请按以下模块组织代码，每个模块放在对应的标签内：
<页面逻辑>
// 包含index.ts、form.ts、waiting.ts、result.ts等页面脚本
</页面逻辑>

<组件代码>
// 包含自定义组件（如配对动画组件、表单组件）
</组件代码>

<样式文件>
// 包含全局样式app.less及各页面样式文件
</样式文件>

<类型定义>
// 包含所有interface定义（types.ts）
</类型定义>

<Mock接口>
// 包含所有模拟接口实现（mock.ts）
</Mock接口>

请确保代码结构清晰，注释完整，符合小程序开发规范。所有动画效果需提供关键帧定义，确保在微信小程序环境中正常运行。
