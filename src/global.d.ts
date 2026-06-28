// src/global.d.ts

// 声明全局变量 APP_VERSION
declare const APP_VERSION: string;

// 如果你还有其他通过 define 注入的环境变量，也可以在这里声明
interface ImportMetaEnv {
    readonly VITE_APP_VERSION: string;
    // 其他环境变量...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}