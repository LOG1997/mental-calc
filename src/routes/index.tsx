import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MODULE_LABELS } from '@/constants/constant'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import PracticeCheckList from '@/components/PracticeCheckList'
import PracticeDialog from '@/components/PracticeDialog'
import type { ModuleType } from '@/types'
import { Settings } from 'lucide-react'


export const Route = createFileRoute('/')({ component: Home })

function Home() {
    const navigate = useNavigate()
    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
            <div className="w-full gap-6 flex flex-wrap justify-start">
                {
                    Object.entries(MODULE_LABELS).map(([module, { name: label }]) => (
                        <Card size="sm" className="mx-auto w-full max-w-sm" key={module}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <p>
                                        {label}
                                    </p>
                                    <PracticeDialog moduleType={module as ModuleType}>
                                        <Button variant="ghost" size="icon" className="ml-auto">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </PracticeDialog>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PracticeCheckList moduleType={module as ModuleType} disabled={true} />
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate({ to: `/practice` })}>
                                    Enter
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                }</div>
        </div>
    )
}
