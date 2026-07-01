import {
    Link,
} from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Layout() {
    const { theme, setTheme } = useTheme()

    return (
        <>
            <header className="sticky top-0 z-40 border-b shadow-sm">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-xl font-bold tracking-tight">
                        🧮 速算练习
                        <span className="text-xs text-gray-500/60">v{APP_VERSION}</span>
                    </Link>

                    <div className="flex items-center gap-4">
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
                        <Separator orientation="vertical" className="h-6 my-auto" />
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </div>
                </div>
            </header>
        </>
    )
}
