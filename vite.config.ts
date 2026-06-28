import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import pkg from './package.json'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = '/mental-calc/'
const config = defineConfig({
    base,
    define: {
        'APP_VERSION': JSON.stringify(pkg.version),
    },
    resolve: { tsconfigPaths: true },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        viteReact(),
    ],
})

export default config
