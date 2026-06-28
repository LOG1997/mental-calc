/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { practiceStore } from '@/stores'
import type { ModuleType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox'

interface ConfigItem {
    enable: boolean;
    desc: string;
    [key: string]: any;
}
export default function PracticeDialog({ children, ...props }: { moduleType: ModuleType, disabled?: boolean, children: React.ReactNode }) {
    const usePracticeStore = practiceStore[props.moduleType]();
    const configList = usePracticeStore.config


    const onCheckedChange = (checked: string | boolean, key: string) => {
        // 1. 创建新的配置对象，避免直接突变状态
        const newConfig = { ...configList };

        // 2. 确保 key 存在于 configList 中，并进行类型断言
        if (key in newConfig) {
            const item = newConfig[key as keyof typeof newConfig] as ConfigItem;
            if (item) {
                item.enable = checked === true; // 处理 Checkbox 可能的 'indeterminate' 状态
            }
        }

        // 3. 调用 store 的 setConfig 更新状态
        usePracticeStore.setConfig(newConfig as any);
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
                        <DialogTitle>设置</DialogTitle>
                        <DialogDescription>
                            设置该题型中您想要练习的种类，全选或者不选都会生成全部的题型
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                        {
                            Object.keys(configList).length > 0 && Object.keys(configList).map((key: string) => {
                                const item: any = configList[key as keyof typeof configList];
                                // 增加运行时检查，防止渲染错误
                                if (!item || typeof item.enable !== 'boolean') return null;

                                return (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            disabled={props.disabled}
                                            onCheckedChange={(checked) => onCheckedChange(checked, key)}
                                            checked={item.enable}
                                            id={`checkbox-${key}`} // 添加 id 以便关联 label
                                        />
                                        <label
                                            htmlFor={`checkbox-${key}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {item.desc}
                                        </label>
                                    </div>
                                );
                            })
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