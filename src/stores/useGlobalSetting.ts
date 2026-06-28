import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleType, QuestionCount } from '@/types';

// 1. 定义 Store 类型（TS 可选，但推荐）
interface GlobalSettingStore {
    config: {
        module: ModuleType;
        questionCount: QuestionCount;
        autoDone: boolean;
    };
    setModule: (module: ModuleType) => void;
    setQuestionCount: (questionCount: QuestionCount) => void;
    setConfig: (info: GlobalSettingStore['config']) => void;
    setAutoDone: (autoDone: boolean) => void;
    clearConfig: () => void;
}

const initialState: {
    module: ModuleType;
    questionCount: QuestionCount;
    autoDone: boolean;
} = {
    module: 'two_digit_add_sub',
    questionCount: 10,
    autoDone: false
};

// 2. 创建持久化 Store
export const useGlobalSettingStore = create<GlobalSettingStore>()(
    persist(
        (set) => ({
            // 初始状态
            config: initialState,
            setModule: (module: ModuleType) => {
                set({
                    config: {
                        ...useGlobalSettingStore.getState().config,
                        module
                    }
                });
            },
            setQuestionCount: (questionCount: QuestionCount) => {
                set({
                    config: {
                        ...useGlobalSettingStore.getState().config,
                        questionCount
                    }
                });
            },
            setAutoDone: (autoDone: boolean) => {
                set({
                    config: {
                        ...useGlobalSettingStore.getState().config,
                        autoDone
                    }
                });
            },
            setConfig: (data: any) => set({ config: data }),
            clearConfig: () => set({ config: initialState }),
        }),
        {
            // 🔥 关键配置：持久化名称（唯一标识 storage key）
            name: 'global-setting-storage',

            // 👇 可选：自定义存储方式（默认 localStorage）
            // storage: createJSONStorage(() => sessionStorage),
        }
    )
);