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
     * 
     * 方法功能描述：
     * -----------
     * 生成一个版本4（随机）的UUID格式字符串，用于创建唯一标识符。
     * 此方法生成的UUID符合RFC 4122规范，可用于前端组件ID、临时数据标识等场景。
     * 
     * 特点：
     * - 无需依赖第三方库
     * - 无需后端支持，纯前端生成
     * - 生成速度快（微秒级）
     * - 冲突概率极低（但非零）
     * 
     * 安全性说明：
     * - 使用Math.random()生成，非加密安全
     * - 不适用于需要密码学安全性的场景
     * - 不保证全局唯一性，但实际使用中冲突概率很低
     * 
     * 性能考量：
     * - 每次调用都是O(1)复杂度
     * - 在现代浏览器中通常能在0.1ms内完成
     * - 适合高频调用场景
     * 
     * 使用示例：
     * @example
     * // 基本用法
     * const uniqueId = IdUtil.randomId();
     * console.log(uniqueId); // 输出类似: '110ec58a-a0f2-4ac4-8393-c866d814b02d'
     * 
     * @example
     * // 作为DOM元素ID
     * const divElement = document.createElement('div');
     * divElement.id = `container-${IdUtil.randomId()}`;
     * document.body.appendChild(divElement);
     * 
     * @example
     * // 生成多个ID并确保不重复
     * const idSet = new Set();
     * for (let i = 0; i < 1000; i++) {
     *   idSet.add(IdUtil.randomId());
     * }
     * console.log(`实际生成了${idSet.size}个不重复ID`); // 预期输出1000
     * 
     * @see https://tools.ietf.org/html/rfc4122 UUID标准规范
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
