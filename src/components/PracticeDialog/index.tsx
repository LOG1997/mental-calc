import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { practiceStore } from '@/stores'
import type { ModuleType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox'

export default function PracticeDialog({ children, ...props }: { moduleType: ModuleType, disabled?: boolean, children: React.ReactNode }) {
    const usePracticeStore = practiceStore[props.moduleType]();
    const configList = usePracticeStore.config


    const onCheckedChange = (checked: string | boolean, key: string) => {
        // usePracticeStore.setConfig()
        console.log('checked', checked, key)
        configList[key as keyof typeof configList].enable = checked as boolean
        usePracticeStore.setConfig(configList)
    }
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    {/* <Button variant="outline">Open Dialog</Button> */}
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                        {
                            Object.keys(configList).length > 0 && Object.keys(configList).map((key: any) => (
                                <div key={key} className="flex items-center">
                                    <Checkbox disabled={props.disabled} onCheckedChange={(checked) => onCheckedChange(checked, key)} checked={configList[key as keyof typeof configList].enable} />
                                    {configList[key as keyof typeof configList].desc}
                                </div>
                            ))
                        }
                    </div>
                    {/* <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter> */}
                </DialogContent>
            </form>
        </Dialog>
    )
}