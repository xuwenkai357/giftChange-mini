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
