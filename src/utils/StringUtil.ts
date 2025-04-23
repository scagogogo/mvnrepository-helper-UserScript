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
     * 
     * 方法功能描述：
     * -----------
     * 将给定文本内容重复指定次数并连接成一个新字符串。该方法类似于ES6中的String.prototype.repeat()，
     * 但提供了额外的参数检查和边界处理，并使用数组优化了字符串拼接性能。
     * 
     * 实现特点：
     * - 使用数组join方法拼接字符串，避免了直接字符串相加的性能问题
     * - 对参数进行类型转换和边界处理，提高健壮性
     * - 自动处理非整数count，向下取整保证结果一致性
     * 
     * 性能考量：
     * - 时间复杂度：O(n)，其中n是结果字符串长度
     * - 空间复杂度：O(n)，需要临时数组存储每个重复项
     * - 对于大量重复或长文本，性能优于简单循环拼接（'+='操作）
     * 
     * 适用场景：
     * - 生成特定模式的字符串（如分隔线、缩进空格等）
     * - 创建重复文本用于测试或UI展示
     * - 构造特定长度的字符串填充内容
     * 
     * 参数详解：
     * - text：必填，待重复的文本内容
     *   * 字符串：按原样重复（如"ab"重复3次得到"ababab"）
     *   * 非字符串：会被自动转换为字符串（如数字123重复2次得到"123123"）
     *   * 空字符串：结果总是空字符串，无论count为何值
     *   
     * - count：必填，重复次数
     *   * 正整数：按指定次数重复
     *   * 零或负数：返回空字符串
     *   * 小数：向下取整（如2.9会被当作2处理）
     *   * NaN：视为0，返回空字符串
     * 
     * 边界情况处理：
     * - count <= 0：返回空字符串
     * - text为空：返回空字符串
     * - count非常大：可能导致内存问题，调用方应注意控制上限
     * 
     * 使用示例：
     * @example
     * // 1. 基本使用
     * const stars = StringUtil.repeat("*", 5);
     * console.log(stars); // 输出: "*****"
     * 
     * @example
     * // 2. 创建缩进
     * function createIndent(level) {
     *   return StringUtil.repeat("  ", level); // 每级缩进两个空格
     * }
     * console.log(createIndent(3) + "文本"); // 输出: "      文本"
     * 
     * @example
     * // 3. 构建分隔线
     * const separator = StringUtil.repeat("-=", 10) + "-";
     * console.log(separator); // 输出: "-=-=-=-=-=-=-=-=-="
     * 
     * @example
     * // 4. 处理非字符串输入
     * console.log(StringUtil.repeat(42, 3)); // 输出: "424242"
     * 
     * @example
     * // 5. 处理边界情况
     * console.log(StringUtil.repeat("text", 0)); // 输出: ""
     * console.log(StringUtil.repeat("text", -1)); // 输出: ""
     * console.log(StringUtil.repeat("", 100)); // 输出: ""
     * 
     * @see String.prototype.repeat ES6内置方法，功能类似但参数处理有差异
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
