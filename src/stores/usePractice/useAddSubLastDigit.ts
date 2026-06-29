import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 定义 Store 类型（TS 可选，但推荐）
interface AddSubLastDigitStore {
    config: {
        add: {
            enable: boolean;
            desc: string;
        };
        sub: {
            enable: boolean;
            desc: string;
        };
        specialSub: {
            enable: boolean;
            desc: string;
        }
    };
    setConfig: (info: AddSubLastDigitStore['config']) => void;
    clearConfig: () => void;
}

const initialState: any = {
    add: {
        enable: true,
        desc: '加法',
    },
    sub: {
        enable: true,
        desc: '减法',
    },
    specialSub: {
        enable: false,
        desc: '特殊练习'
    }
};

// 2. 创建持久化 Store
export const useAddSubLastDigitStore = create<AddSubLastDigitStore>()(
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
            name: 'add_sub_last_digit-storage',

            // 👇 可选：自定义存储方式（默认 localStorage）
            // storage: createJSONStorage(() => sessionStorage),
        }
    )
);