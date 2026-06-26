import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 定义 Store 类型（TS 可选，但推荐）
interface TwoDigitAddSubStore {
    config: {
        noCarryAdd: {
            enable: boolean;
            desc: string;
        };
        carryAdd: {
            enable: boolean;
            desc: string;
        };
        noBorrowSub: {
            enable: boolean;
            desc: string;
        };
        borrowSub: {
            enable: boolean;
            desc: string;
        };
    };
    setConfig: (info: TwoDigitAddSubStore['config']) => void;
    clearConfig: () => void;
}

const initialState: any = {
    noCarryAdd: {
        enable: true,
        desc: '不进位加法',
    },
    carryAdd: {
        enable: true,
        desc: '进位加法',
    },
    noBorrowSub: {
        enable: true,
        desc: '不借位减法',
    },
    borrowSub: {
        enable: true,
        desc: '借位减法',
    }
};

// 2. 创建持久化 Store
export const useTwoDigitAddSubStore = create<TwoDigitAddSubStore>()(
    persist(
        (set) => ({
            // 初始状态
            config: initialState,

            // 修改数据的方法
            setConfig: (data) => set({ config: data }),
            clearConfig: () => set({ config: initialState }),
        }),
        {
            // 🔥 关键配置：持久化名称（唯一标识 storage key）
            name: 'two-digit-add-sub-storage',

            // 👇 可选：自定义存储方式（默认 localStorage）
            // storage: createJSONStorage(() => sessionStorage),
        }
    )
);