import { Toaster } from "@/components/ui/sonner"
import { Outlet } from '@tanstack/react-router'
import Header from './Header';
import { usePageStateStore } from '@/stores'
import { ThemeProvider } from "@/components/theme-provider"

export default function Layout() {
    const pageStateStore = usePageStateStore()
    return (
        <>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >

                {
                    !pageStateStore.practiceConfig.isStarted && <Header />
                }
                <main className="mt-10">
                    <Outlet />
                </main>
                <Toaster />
            </ThemeProvider>
        </>
    )
}
