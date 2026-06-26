import { Toaster } from "@/components/ui/sonner"
import { Outlet } from '@tanstack/react-router'
import Header from './Header';

export default function Layout() {
    return (
        <>
            <Header />
            <main className="mt-8">
                <Outlet />
            </main>
            <Toaster />
        </>
    )
}
