import React, { useState } from 'react';

// ----- 类型定义 -----
export interface NumpadProps {
    /** 外部受控值（若不传则内部维护状态） */
    value?: string;
    /** 值变化时的回调 */
    onChange?: (value: string) => void;
    /** 确认按钮点击回调（可选），若不传则点击确认只触发 onChange */
    onConfirm?: (value: string) => void;
    /** 是否显示小数点按钮，默认 false */
    decimal?: boolean;
    /** 最大输入长度（含小数点），默认 10 */
    maxLength?: number;
    /** 自定义按键布局（覆盖默认布局），高级用法 */
    customRows?: string[][];
}

// 按键类型
type KeyType = string;

// 默认布局（当 decimal 为 false 时调整）
const getDefaultRows = (decimal: boolean): KeyType[][] => {
    const rows: KeyType[][] = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        decimal ? ['.', '0', 'backspace'] : ['', '0', 'backspace'],
        ['clear', '', 'confirm'],
    ];
    return rows;
};

/**
 * 数字键盘组件（长显于页面，适合移动端）
 */
const Numpad: React.FC<NumpadProps> = ({
    value: externalValue,
    onChange,
    onConfirm,
    decimal = false,
    maxLength = 10,
    customRows,
}) => {
    // 内部状态（当未受控时使用）
    const [internalValue, setInternalValue] = useState<string>('');

    // 实际使用的值
    const value = externalValue !== undefined ? externalValue : internalValue;

    // 更新值（触发回调）
    const updateValue = (newValue: string): void => {
        // 长度限制
        if (newValue.length > maxLength) return;
        setInternalValue(newValue);
        if (onChange) onChange(newValue);
    };

    // 按键点击处理
    const handleKeyPress = (key: KeyType): void => {
        if (key === 'clear') {
            updateValue('');
            return;
        }
        if (key === 'backspace') {
            updateValue(value.slice(0, -1));
            return;
        }
        if (key === '.') {
            // 防止多个小数点
            if (value.includes('.')) return;
            // 如果当前为空，补 '0.'
            if (value === '') {
                updateValue('0.');
                return;
            }
            updateValue(value + '.');
            return;
        }
        // 数字（0-9）
        if (/^\d$/.test(key)) {
            updateValue(value + key);
        }
        // 其他特殊键（如 * #）可自行扩展
    };

    // 确认按钮
    const handleConfirm = (): void => {
        if (onConfirm) {
            onConfirm(value);
            console.log('确认输入:', value);

        }
        // 即使没有 onConfirm，也确保 onChange 被调用（若已受控）
        if (onChange) onChange(value);
        updateValue('');
    };

    // 确定使用的按键布局
    const rows = customRows || getDefaultRows(decimal);

    return (
        <div className="w-full max-w-md mx-auto bg-gray-100 rounded-2xl shadow-lg p-3 select-none touch-none">
            {/* 键盘网格 */}
            <div className="grid grid-cols-3 gap-2">
                {rows.map((row, rowIndex) =>
                    row.map((key, colIndex) => {
                        // 空占位
                        if (key === '') {
                            return <div key={`empty-${rowIndex}-${colIndex}`} />;
                        }

                        // 判断按钮样式
                        let btnClass =
                            'h-14 rounded-xl text-xl font-medium transition-all duration-150 active:scale-95 ';
                        let label: string = key;

                        if (key === 'backspace') {
                            btnClass += 'bg-gray-200 text-gray-700 active:bg-gray-300';
                            label = '⌫';
                        } else if (key === 'clear') {
                            btnClass += 'bg-red-200 text-red-700 active:bg-red-300 col-span-1';
                            label = 'C';
                        } else if (key === 'confirm') {
                            btnClass += 'bg-blue-500 text-white active:bg-blue-600 col-span-1';
                            label = '✓';
                        } else if (key === '.') {
                            btnClass += 'bg-gray-200 text-gray-700 active:bg-gray-300';
                        } else {
                            // 数字或其他字符
                            btnClass += 'bg-white text-gray-800 active:bg-gray-200 shadow-sm';
                        }

                        const handleClick = (): void => {
                            if (key === 'confirm') {
                                handleConfirm();
                            } else {
                                handleKeyPress(key);
                            }
                        };

                        return (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                className={btnClass}
                                onClick={handleClick}
                                // 移动端触摸反馈
                                onTouchStart={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.95)';
                                    // 震动反馈
                                    if ('vibrate' in navigator) {
                                        navigator.vibrate(50);
                                    }
                                }}
                                onTouchEnd={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                {label}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Numpad;