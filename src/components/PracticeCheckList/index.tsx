import { practiceStore } from '@/stores'
import type { ModuleType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox'

export default function PracticeCheckList(props: { moduleType: ModuleType, disabled?: boolean }) {
    const usePracticeStore = practiceStore[props.moduleType]();
    const configList = usePracticeStore.config
    return (
        <div className="flex gap-2">
            {
                Object.keys(configList).length > 0 && Object.keys(configList).map((key: any) => (
                    <div key={key} className="flex items-center">
                        <Checkbox disabled={props.disabled} checked={configList[key as keyof typeof configList].enable} />
                        {configList[key as keyof typeof configList].desc}
                    </div>
                ))
            }
        </div>
    )
}
