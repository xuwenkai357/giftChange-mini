import { ApiResponse, CheckStatusResponse, FormData, PairInfo } from '../types/types';

// Simulate database
let submittedUsers: FormData[] = [];
let pairs: PairInfo[] = [];

// Mock latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock User Data
const MOCK_USERS = [
    { avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHdRmejTqprtQ/0', nickName: 'Snowman', callName: 'Frosty', hasGift: true },
    { avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHdRmejTqprtQ/0', nickName: 'Rudolph', callName: 'Rudy', hasGift: true },
    { avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHdRmejTqprtQ/0', nickName: 'Elf', callName: 'Buddy', hasGift: false },
    { avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHdRmejTqprtQ/0', nickName: 'Grinch', callName: 'Mr. Grinch', hasGift: true },
    { avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHdRmejTqprtQ/0', nickName: 'Santa', callName: 'Nick', hasGift: true },
];

export const mockApi = {
    checkStatus: async (openid: string): Promise<ApiResponse<CheckStatusResponse>> => {
        await delay(500);
        const user = submittedUsers.find(u => u.openid === openid);
        const isSubmitted = !!user;

        // Check if user is in a pair
        const isPaired = pairs.some(p =>
            (p.user1.nickName === user?.nickName) || // In real app use openid, here simplified
            (p.user2.nickName === user?.nickName)
        );

        return {
            code: 0,
            data: {
                isSubmitted,
                isPaired,
                hasGift: user?.hasGift
            },
            msg: 'success'
        };
    },

    submitForm: async (data: FormData): Promise<ApiResponse<null>> => {
        await delay(800);
        submittedUsers.push(data);

        // Auto pair simulation for demo
        if (submittedUsers.length >= 2 && pairs.length === 0) {
            // Create a mock pair between the current user and a random mock user or another submitted user
            // For simplicity in demo, let's just pair immediately with a mock user if available
            // Or wait for next poll. let's leave it for polling logic to "find" a pair.
        }

        return {
            code: 0,
            data: null,
            msg: 'success'
        };
    },

    getPairInfo: async (openid: string): Promise<ApiResponse<PairInfo | null>> => {
        await delay(600);
        const user = submittedUsers.find(u => u.openid === openid);
        if (!user) return { code: 0, data: null, msg: 'User not found' };

        // Simple pairing logic for demo: Pair with a random mock user if not already paired
        let pair = pairs.find(p => p.user1.nickName === user.nickName || p.user2.nickName === user.nickName);

        if (!pair) {
            // 50% chance to find a pair per request to simulate waiting
            if (Math.random() > 0.5) {
                const partner = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
                pair = {
                    user1: {
                        avatar: user.avatarUrl,
                        nickName: user.nickName,
                        callName: user.callName,
                        hasGift: user.hasGift
                    },
                    user2: {
                        avatar: partner.avatarUrl,
                        nickName: partner.nickName,
                        callName: partner.callName,
                        hasGift: partner.hasGift
                    }
                };
                pairs.push(pair);
            }
        }

        return {
            code: 0,
            data: pair || null,
            msg: 'success'
        };
    }
};
