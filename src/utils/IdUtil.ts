/**
 * ID 工具类，提供生成唯一标识符相关方法
 * 使用静态方法组织工具函数，避免实例化开销
 */
export default class IdUtil {
    /**
     * 生成一个符合UUID格式的随机字符串
     * 示例输出：'110ec58a-a0f2-4ac4-8393-c866d814b02d'
     *
     * @returns {string} 格式为xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx的随机字符串
     *
     * 实现原理：
     * 1. 使用预定义模板字符串，其中'x'表示随机十六进制数字
     * 2. 'y'表示特殊处理的随机十六进制数字（仅限8、9、A或B）
     * 3. 数字4保证UUID版本标识符的正确性
     */
    static randomId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
            // 生成0-15的随机整数
            const r = Math.random() * 16 | 0;

            // 对'y'进行特殊处理：取随机数的低2位与0x3进行或运算，然后与0x8进行或运算
            // 保证结果在8-11之间（二进制1000到1011），最后转换为十六进制字符（8、9、a、b）
            const v = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }
}
