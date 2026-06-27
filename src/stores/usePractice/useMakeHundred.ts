import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 定义 Store 类型（TS 可选，但推荐）
interface MakeHundredStore {
    config: {
        aboveHundred: {
            enable: boolean;
            desc: string;
        };
        belowHundred: {
            enable: boolean;
            desc: string;
        };
    };
    setConfig: (info: MakeHundredStore['config']) => void;
    clearConfig: () => void;
}

const initialState: any = {
    aboveHundred: {
        enable: true,
        desc: '超过一百',
    },
    belowHundred: {
        enable: true,
        desc: '一百以下',
    },
};

// 2. 创建持久化 Store
export const useMakeHundredStore = create<MakeHundredStore>()(
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
            name: 'make-hundred-storage',

            // 👇 可选：自定义存储方式（默认 localStorage）
            // storage: createJSONStorage(() => sessionStorage),
        }
    )
);