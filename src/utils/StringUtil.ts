/**
 * 字符串工具类
 *
 * 提供字符串处理相关工具方法
 */
export default class StringUtil {
    /**
     * 将指定文本重复指定次数后拼接为字符串返回
     *
     * @example
     * // 返回 "ababab"
     * StringUtil.repeat("ab", 3)
     *
     * @example
     * // 处理边界情况返回 ""
     * StringUtil.repeat("x", 0)
     *
     * @param text  - 需要重复的文本内容（示例："a"）
     * @param count - 重复次数（必须是非负整数，示例：3）
     * @returns 拼接后的字符串。当count<=0时返回空字符串
     */
    static repeat(text: string, count: number): string {
        // 使用数组缓存提高性能（相比字符串直接拼接）
        const buff: string[] = [];

        // 处理无效count值（NaN/负数等情况）
        const validCount = Math.max(Math.floor(count), 0);

        for (let i = 0; i < validCount; i++) {
            buff.push(text);
        }
        return buff.join("");
    }
}
