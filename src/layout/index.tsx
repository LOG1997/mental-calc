import { Toaster } from "@/components/ui/sonner"
import { Outlet } from '@tanstack/react-router'
import Header from './Header';
import { usePageStateStore } from '@/stores'

export default function Layout() {
    const pageStateStore = usePageStateStore()
    return (
        <>
            {
                !pageStateStore.practiceConfig.isStarted && <Header />
            }
            <main className="mt-10">
                <Outlet />
            </main>
            <Toaster />
        </>
    )
}
