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
     * 
     * 方法功能描述：
     * -----------
     * 使当前异步函数执行暂停指定的毫秒数。本质上是对setTimeout的Promise包装，
     * 使其可以在async/await语法环境中优雅地实现延时功能。
     * 
     * 延时精度说明：
     * - 实际延迟时间可能略长于指定时间（通常不超过几毫秒）
     * - 在浏览器中，最小延迟可能受到限制（如非活动标签页最小延迟4ms）
     * - 非精确计时场景，不适用于需要高精度计时的场景
     * 
     * 使用场景：
     * - 实现API请求节流和限速
     * - 模拟网络延迟进行测试
     * - 控制动画或UI更新的时间间隔
     * - 实现轮询功能时设置检查间隔
     * - 避免过快渲染导致UI卡顿
     * 
     * 性能考量：
     * - 不会阻塞JS主线程，但会占用Promise微任务队列
     * - 大量短时间sleep可能影响事件循环效率
     * - 不会增加CPU使用率（与忙等待不同）
     * 
     * 参数详解：
     * - mils：必填，延迟时间，单位为毫秒(ms)
     *   * 正数：等待指定毫秒数（如1000表示1秒）
     *   * 零或负数：立即执行（不等待）
     *   * 非整数：会被取整(不会四舍五入，直接截断小数部分)
     *   * 非数字：转换失败会立即执行
     * 
     * 异常处理：
     * - 本方法不抛出异常
     * - Promise永远会被resolve，不会reject
     * - 传入无效参数时会尝试转换为数字，失败则立即resolve
     * 
     * 使用示例：
     * @example
     * // 1. 简单延时
     * async function demo() {
     *   console.log('开始');
     *   await SleepUtil.sleep(2000); // 暂停2秒
     *   console.log('2秒后继续执行');
     * }
     * 
     * @example
     * // 2. 在循环中使用
     * async function sendBatchRequests(items) {
     *   for (const item of items) {
     *     await sendRequest(item);
     *     await SleepUtil.sleep(300); // 每个请求间隔300ms，避免服务器过载
     *   }
     * }
     * 
     * @example 
     * // 3. 结合Promise.race实现超时控制
     * async function fetchWithTimeout(url, timeout = 5000) {
     *   const timeoutPromise = SleepUtil.sleep(timeout).then(() => {
     *     throw new Error('请求超时');
     *   });
     *   return Promise.race([fetch(url), timeoutPromise]);
     * }
     * 
     * @see setTimeout JavaScript内置定时器函数
     */
    static async sleep(mils: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, mils));
    }
}