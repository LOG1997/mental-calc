import { create } from 'zustand';
import { devtools } from 'zustand/middleware'
// 1. 定义 Store 类型（TS 可选，但推荐）
interface PageStateStore {
    practiceConfig: {
        isStarted: boolean;
    }
    setPracticeConfig: (data: any) => void;
    clear: () => void;
}



// 2. 创建持久化 Store
export const usePageStateStore = create<PageStateStore>()(
    devtools((set) => ({
        practiceConfig: {
            isStarted: false
        },
        setPracticeConfig: (data) => set((state) => ({
            practiceConfig: { ...state.practiceConfig, ...data }
        })),
        clear: () => set(() => ({
            practiceConfig: { isStarted: false }
        })),
    }), {
        name: 'page-state-store'
    }),
);