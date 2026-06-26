import {
    Link,
} from "@tanstack/react-router";

export default function Layout() {
    return (
        <>
            <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-xl font-bold tracking-tight">
                        🧮 速算练习
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            to="/practice"
                            className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary [&.active]:font-semibold"
                        >
                            练习
                        </Link>
                        <Link
                            to="/history"
                            className="text-sm font-medium transition-colors hover:text-primary [&.active]:text-primary [&.active]:font-semibold"
                        >
                            历史
                        </Link>
                    </nav>
                </div>
            </header>
        </>
    )
}
