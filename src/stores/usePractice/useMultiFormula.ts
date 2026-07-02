import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. 定义 Store 类型（TS 可选，但推荐）
interface MultiFormulaStore {
    config: {
        smallMulti: {
            enable: boolean;
            desc: string;
        };
        bigMulti: {
            enable: boolean;
            desc: string;
        };
    };
    setConfig: (info: MultiFormulaStore['config']) => void;
    clearConfig: () => void;
}

const initialState: any = {
    smallMulti: {
        enable: false,
        desc: '小九九乘法',
    },
    bigMulti: {
        enable: true,
        desc: '大九九乘法',
    },
};

// 2. 创建持久化 Store
export const useMultiFormulaStore = create<MultiFormulaStore>()(
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
            name: 'multi_formula-storage',

            // 👇 可选：自定义存储方式（默认 localStorage）
            // storage: createJSONStorage(() => sessionStorage),
        }
    )
);