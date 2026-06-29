import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { ModuleType } from '@/types';
import { ConfigEditContent } from './ConfigEditContent'

export default function PracticeDialog({ children, ...props }: { moduleType: ModuleType, disabled?: boolean, children: React.ReactNode }) {

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {/* <Button variant="outline">Open Dialog</Button> */}
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>设置</DialogTitle>
                        <DialogDescription>
                            设置该题型中您想要练习的种类，全选或者不选都会生成全部的题型
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                        <ConfigEditContent moduleType={props.moduleType} disabled={props.disabled} />
                    </div>
                </DialogContent>
            </form>
        </Dialog>
    )
}