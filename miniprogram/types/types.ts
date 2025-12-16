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
