// ======== 时间格式化 ========

export function formatTime(totalSecs: number): string {
    if (totalSecs < 0) return "0 秒";
    if (totalSecs < 60) {
        return `${totalSecs.toFixed(1)} 秒`;
    }

    const minutes = Math.floor(totalSecs / 60);
    const seconds = Math.floor(totalSecs % 60);

    // 如果秒数为0，只显示分
    if (seconds === 0) return `${minutes} 分`;
    return `${minutes} 分 ${seconds} 秒`;
}