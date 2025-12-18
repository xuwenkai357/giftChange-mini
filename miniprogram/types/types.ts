export interface FormData {
  openid: string;
  avatarUrl: string;
  nickName: string;
  callName: string;
  hasGift: boolean;
}

export interface UserInfo {
  avatar: string;
  nickName: string;
  callName: string;
  hasGift: boolean;
}

export interface PairInfo {
  user1: UserInfo;
  user2: UserInfo;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export interface CheckStatusResponse {
  isSubmitted: boolean;
  isPaired: boolean; // Added isPaired to checking status
  hasGift?: boolean; // Return user's own gift status if submitted
}

export type UserEventState = 'UNREGISTERED' | 'PENDING' | 'MATCHED';

export interface UserEventStatusResponse {
  state: UserEventState;
  my_info?: {
    wx_nickname: string;
    avatar_url: string;
    has_gift: number;
  };
  partner_info?: {
    wx_nickname: string;
    preferred_name: string;
    avatar_url: string;
  } | null;
}

export interface UserListResponse {
  /**
   * id, wx_nickname, preferred_name, avatar_url, has_gift, match_status, pair_code
   */
  list: User[];
}

export interface User {
  id: string;
  wx_nickname: string;
  preferred_name: string;
  avatar_url: string;
  has_gift: number;
  match_status: string;
  pair_code: string;
  matched_target_id: string;
}

export interface RegistrationParams {
  openid: string;
  wx_nickname?: string;
  preferred_name?: string;
  avatar_url: string;
  has_gift: number | boolean | string;
}

export interface RegistrationResult {
  id: string;
  openid: string;
  activity_date: string;
  wx_nickname: string;
  preferred_name: string;
  avatar_url: string;
  has_gift: number;
  match_status: string; // 'PENDING' | 'MATCHED'
  matched_target_id: string | null;
  pair_code: string | null;
  create_time: string;
}

// 单个配对项的数据结构
export interface PairItem {
  /** 当前用户的 ID (数据库主键) */
  id: number;
  /** 配对目标的 ID (对方的数据库主键) */
  matched_target_id: number;
  /** 配对组编号 (例如 "A", "B", "GROUP-1") */
  pair_code?: string;
}

// 接口请求参数结构
export interface SubmitPairsRequest {
  /** 配对列表数组 */
  pairs: PairItem[];
}

// 接口响应结构
export interface SubmitPairsResponse {
  err_code: number;
  err_msg: string;
  data: {
    total_received: number;
    processed_count: number;
  };
}