/**
 * 延时工具类，提供异步等待功能
 *
 * 使用示例：
 * @example
 * // 等待1秒钟
 * await SleepUtil.sleep(1000);
 */
export default class SleepUtil {

    /**
     * 创建指定毫秒数的延时Promise
     *
     * @param {number} mils - 需要等待的毫秒数
     * @returns {Promise<void>} 在指定时间后resolve的Promise
     *
     * @example
     * // 在异步函数中使用
     * async function fetchData() {
     *   await SleepUtil.sleep(500); // 等待500ms
     *   return fetch('/api/data');
     * }
     *
     * @example
     * // 用于轮询间隔
     * while(true) {
     *   checkStatus();
     *   await SleepUtil.sleep(3000); // 每3秒检查一次
     * }
     */
    static async sleep(mils: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, mils));
    }
}