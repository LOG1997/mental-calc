import { createFileRoute } from '@tanstack/react-router'
import { MODULE_LABELS } from '@/constants/constant'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
            {
                //    遍历MODULE_LABELS

            }
        </div>
    )
}
