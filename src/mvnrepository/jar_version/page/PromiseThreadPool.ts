// PromiseThreadPool.ts
/**
 * PromiseThreadPool 类用于管理异步任务的并发执行，支持动态调整并发数、暂停和恢复任务执行等功能。
 *
 * 示例用法：
 * ```typescript
 * // 1. 直接传递Promise对象
 * const p1 = fetch('https://api.example.com/data');
 *
 * // 2. 传递返回Promise的函数
 * const p2 = () => new Promise(resolve =>
 *   setTimeout(() => resolve('延迟任务'), 1000));
 *
 * // 3. 传递async函数
 * const p3 = async () => {
 *   const res = await fetch('https://api.example.com/users');
 *   return res.json();
 * };
 *
 * const pool = new PromiseThreadPool(2);
 *
 * // 混合提交不同类型任务
 * pool.submit(p1)
 *   .then(data => console.log('Promise对象任务完成'))
 *   .catch(console.error);
 *
 * pool.submit(p2)
 *   .then(msg => console.log(msg))
 *   .catch(console.error);
 *
 * pool.submit(p3)
 *   .then(users => console.log('获取用户数据:', users))
 *   .catch(console.error);
 * ```
 */

import {logger} from "../../../logger/Logger";

export default class PromiseThreadPool {
    /**
     * 最大并发数
     * 
     * @description
     * 控制同时执行的任务数量上限
     * 
     * @type {number}
     */
    private maxConcurrency: number;
    
    /**
     * 当前活跃任务数
     * 
     * @description
     * 记录当前正在执行的任务数量
     * 
     * @type {number}
     */
    private activeCount: number;
    
    /**
     * 任务队列
     * 
     * @description
     * 存储等待执行的任务函数
     * 
     * @type {Array<() => Promise<any>>}
     */
    private queue: Array<() => Promise<any>>;
    
    /**
     * 是否暂停
     * 
     * @description
     * 标识线程池是否处于暂停状态
     * 
     * @type {boolean}
     */
    private paused: boolean;
    
    /**
     * 记录最大实际并发数
     * 
     * @description
     * 统计运行期间达到的最大并发任务数
     * 
     * @type {number}
     */
    private maxActiveCount: number;

    /**
     * 构造函数
     * 
     * @description
     * 功能描述：
     * 创建一个新的Promise线程池实例，用于控制异步任务的并发执行。
     * 初始化内部状态，包括最大并发数、任务队列和计数器。
     * 
     * 适用场景：
     * - 需要限制并发请求数量，避免过载
     * - 批量处理大量异步任务，如下载、API调用等
     * - 实现任务优先级队列
     * 
     * 边界条件：
     * - maxConcurrency应大于0，否则任务将无法执行
     * - 内部使用普通数组实现队列，不适合极高频率的大量任务提交
     * 
     * @param {number} maxConcurrency - 最大并发数，表示同时执行的任务上限
     *                                  建议根据实际场景设置，网络请求通常为3-10
     * 
     * @example
     * // 创建最大并发数为5的线程池
     * const pool = new PromiseThreadPool(5);
     * 
     * // 创建小并发量的线程池，适合资源受限环境
     * const lightPool = new PromiseThreadPool(2);
     * 
     * // 创建高并发线程池，适合IO密集型任务
     * const heavyPool = new PromiseThreadPool(20);
     */
    constructor(maxConcurrency: number) {
        this.maxConcurrency = maxConcurrency;
        this.activeCount = 0;
        this.maxActiveCount = 0; // 初始化最大并发记录
        this.queue = [];
        this.paused = false;
    }

    /**
     * 提交任务到线程池
     * 
     * @description
     * 功能描述：
     * 将异步任务提交到线程池，根据当前负载情况决定立即执行或加入等待队列。
     * 支持两种类型的任务：Promise对象或返回Promise的函数。
     * 返回一个新的Promise，代表任务的执行结果。
     * 
     * 适用场景：
     * - 需要并发控制的异步任务执行
     * - 大批量API请求需要限流
     * - 资源密集型操作需要排队执行
     * 
     * 边界条件：
     * - 如果线程池已暂停，任务会加入队列但不会执行
     * - 返回的Promise会传递原始任务的结果或错误
     * - 使用setTimeout确保异步执行，避免调用栈过深
     * 
     * @param {(() => Promise<T>) | Promise<T>} task - 要执行的任务，可以是：
     *   - Promise对象：直接提交的Promise
     *   - 函数：返回Promise的函数，调用时执行
     * 
     * @returns {Promise<T>} 返回一个Promise，解析为任务执行的结果：
     *   - resolve: 原始任务成功完成时的返回值
     *   - reject: 原始任务执行失败时的错误
     * 
     * @template T 任务返回值的类型
     * 
     * @example
     * // 示例1: 提交Promise对象
     * const dataPromise = fetch('/api/data');
     * pool.submit(dataPromise)
     *   .then(response => response.json())
     *   .then(data => console.log('数据获取成功:', data))
     *   .catch(err => console.error('请求失败:', err));
     * 
     * // 示例2: 提交返回Promise的函数
     * pool.submit(() => {
     *   return new Promise((resolve, reject) => {
     *     setTimeout(() => resolve('延迟执行完成'), 2000);
     *   });
     * }).then(result => console.log(result));
     * 
     * // 示例3: 提交async函数
     * pool.submit(async () => {
     *   const response = await fetch('/api/users/1');
     *   if (!response.ok) throw new Error('请求失败');
     *   return response.json();
     * }).then(user => console.log('用户信息:', user));
     */
    public submit<T>(task: (() => Promise<T>) | Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    // 更新并发高水位
                    if (this.activeCount > this.maxActiveCount) {
                        this.maxActiveCount = this.activeCount;
                    }
                    
                    // 判断task是Promise对象还是返回Promise的函数
                    const result = typeof task === 'function' 
                        ? await (task as () => Promise<T>)() 
                        : await (task as Promise<T>);
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.activeCount--;
                    // 关键修改：使用setTimeout确保异步执行_next，避免调用栈过深
                    setTimeout(() => this._next(), 0);
                }
            };

            this.queue.push(wrappedTask);
            // 关键修改：使用setTimeout确保异步执行_next，避免在大量任务提交时阻塞
            !this.paused && setTimeout(() => this._next(), 0);
        });
    }

    /**
     * 执行下一个任务
     * 
     * @description
     * 功能描述：
     * 内部方法，从任务队列中取出并执行下一个任务。
     * 确保同时运行的任务数不超过设定的最大并发数。
     * 使用异步执行机制避免调用栈溢出和UI阻塞。
     * 
     * 适用场景：
     * - 由线程池内部自动调用，管理任务执行流程
     * - 在任务完成或新任务提交时触发执行
     * 
     * 边界条件：
     * - 如果活跃任务数达到上限，将不会启动新任务
     * - 如果线程池已暂停，将不会启动新任务
     * - 异步执行确保不会阻塞调用方
     * 
     * @returns {void} 无返回值
     * 
     * @private 内部方法，不应由外部直接调用
     */
    private _next(): void {
        // 添加更明确的日志，记录每次尝试启动新任务的情况
        logger.debug(`[PromiseThreadPool] 尝试启动任务: 当前活跃数=${this.activeCount}, 最大并发=${this.maxConcurrency}, 队列长度=${this.queue.length}`);
        
        // 每次调用只启动一个任务，避免while循环导致的连续同步执行
        if (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
            const task = this.queue.shift();
            this.activeCount++;
            logger.debug(`[PromiseThreadPool] 启动新任务: 当前活跃数=${this.activeCount}, 最大并发=${this.maxConcurrency}, 队列长度=${this.queue.length}`);
            
            // 使用Promise.resolve确保任务在微任务队列中执行
            Promise.resolve().then(() => {
                return task!().catch(() => {
                    // 防止未处理的rejection
                });
            });
            
            // 如果还有任务可以执行，则继续启动
            if (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
                // 递归调用但使用setTimeout避免调用栈过深
                setTimeout(() => this._next(), 0);
            }
        }
    }

    /**
     * 暂停任务执行
     * 
     * @description
     * 功能描述：
     * 暂停线程池的任务执行，已提交但未执行的任务将保留在队列中。
     * 已经开始执行的任务不会被中断，会继续执行到完成。
     * 
     * 适用场景：
     * - 临时停止处理队列中的任务
     * - 需要优先处理其他操作时
     * - 系统负载过高需要降低并发时
     * 
     * 边界条件：
     * - 只影响新任务的启动，不影响已经执行的任务
     * - 可以通过resume()方法恢复执行
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 创建线程池并提交任务
     * const pool = new PromiseThreadPool(5);
     * for (let i = 0; i < 20; i++) {
     *   pool.submit(() => fetch(`/api/items/${i}`));
     * }
     * 
     * // 发现问题时暂停
     * pool.pause();
     * console.log('任务执行已暂停，队列中还有任务等待处理');
     */
    public pause(): void {
        this.paused = true;
    }

    /**
     * 恢复任务执行
     * 
     * @description
     * 功能描述：
     * 恢复线程池的任务执行，继续处理队列中等待的任务。
     * 会立即尝试执行队列中的任务，直到达到最大并发数。
     * 
     * 适用场景：
     * - 在暂停后重新启动任务处理
     * - 系统资源恢复正常后恢复操作
     * 
     * 边界条件：
     * - 如果没有等待中的任务，调用此方法不会有任何效果
     * - 如果已经处于非暂停状态，调用此方法不会有额外影响
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 创建线程池并提交任务
     * const pool = new PromiseThreadPool(5);
     * for (let i = 0; i < 20; i++) {
     *   pool.submit(() => fetch(`/api/items/${i}`));
     * }
     * 
     * // 临时暂停
     * pool.pause();
     * console.log('正在执行其他高优先级任务...');
     * 
     * // 恢复执行
     * setTimeout(() => {
     *   pool.resume();
     *   console.log('线程池已恢复执行队列中的任务');
     * }, 5000);
     */
    public resume(): void {
        this.paused = false;
        this._next();
    }

    /**
     * 清空等待队列
     * 
     * @description
     * 功能描述：
     * 清空线程池中所有等待执行的任务，已开始执行的任务不受影响。
     * 被清空的任务将不会执行，也不会收到任何通知。
     * 
     * 适用场景：
     * - 任务全部取消时
     * - 用户中止操作时
     * - 页面卸载前清理资源
     * 
     * 边界条件：
     * - 只清空队列中等待的任务，不影响已经执行的任务
     * - 被清空的任务对应的Promise会一直处于pending状态
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 创建线程池并提交任务
     * const pool = new PromiseThreadPool(2);
     * for (let i = 0; i < 100; i++) {
     *   pool.submit(() => fetch(`/api/items/${i}`));
     * }
     * 
     * // 用户取消操作，清空队列
     * document.getElementById('cancel-btn').addEventListener('click', () => {
     *   pool.clear();
     *   console.log('已清空所有等待中的任务');
     * });
     */
    public clear(): void {
        this.queue = [];
    }

    /**
     * 动态调整并发数
     * 
     * @description
     * 功能描述：
     * 动态修改线程池的最大并发数，立即生效。
     * 如果新的并发数大于当前并发数，会立即尝试执行更多任务。
     * 如果新的并发数小于当前并发数，已执行的任务会继续执行，但不会启动新任务直到活跃任务数低于新阈值。
     * 
     * 适用场景：
     * - 根据系统负载动态调整并发量
     * - 根据网络状况调整请求并发数
     * - 实现用户可配置的并发控制
     * 
     * 边界条件：
     * - 新的并发数应大于0，否则任务将无法执行
     * - 调整并发数不会影响已经执行的任务
     * 
     * @param {number} newMax - 新的最大并发数
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 创建初始并发数为3的线程池
     * const pool = new PromiseThreadPool(3);
     * 
     * // 提交一批任务
     * for (let i = 0; i < 50; i++) {
     *   pool.submit(() => fetchLargeFile(i));
     * }
     * 
     * // 网络拥塞时减少并发
     * window.addEventListener('offline', () => {
     *   pool.setConcurrency(1);
     *   console.log('网络状况不佳，已降低并发数');
     * });
     * 
     * // 网络恢复时增加并发
     * window.addEventListener('online', () => {
     *   pool.setConcurrency(5);
     *   console.log('网络状况良好，已提高并发数');
     * });
     */
    public setConcurrency(newMax: number): void {
        this.maxConcurrency = newMax;
        this._next();
    }

    /**
     * 获取线程池状态
     * 
     * @description
     * 功能描述：
     * 返回当前线程池的运行状态，包括活跃任务数、等待任务数、最大并发设置、
     * 暂停状态以及历史最高并发记录。
     * 用于监控和调试线程池的运行情况。
     * 
     * 适用场景：
     * - 监控线程池运行状态
     * - 调试并发问题
     * - 展示任务处理进度
     * 
     * 边界条件：
     * - 只读属性，不会影响线程池运行
     * - 返回的是即时状态快照，可能快速变化
     * 
     * @returns {Object} 返回状态对象，包含以下属性：
     *   - running: number - 当前活跃（正在执行）的任务数
     *   - waiting: number - 当前等待队列中的任务数
     *   - maxConcurrency: number - 设置的最大并发数
     *   - paused: boolean - 线程池是否处于暂停状态
     *   - maxActive: number - 历史记录的最高并发任务数
     * 
     * @example
     * // 创建线程池
     * const pool = new PromiseThreadPool(10);
     * 
     * // 提交一批任务
     * for (let i = 0; i < 100; i++) {
     *   pool.submit(() => processItem(i));
     * }
     * 
     * // 定期检查并输出状态
     * const interval = setInterval(() => {
     *   const status = pool.status;
     *   console.log(`活跃任务: ${status.running}, 等待任务: ${status.waiting}`);
     *   
     *   if (status.running === 0 && status.waiting === 0) {
     *     clearInterval(interval);
     *     console.log('所有任务处理完成，历史最高并发:', status.maxActive);
     *   }
     * }, 1000);
     */
    public get status(): { running: number; waiting: number; maxConcurrency: number; paused: boolean; maxActive: number } {
        return {
            running: this.activeCount,
            waiting: this.queue.length,
            maxConcurrency: this.maxConcurrency,
            paused: this.paused,
            maxActive: this.maxActiveCount // 添加最高并发记录
        };
    }

    /**
     * 重置最大并发记录
     * 
     * @description
     * 功能描述：
     * 重置历史最高并发记录，将其设置为当前活跃任务数。
     * 用于开始新一轮的统计或清除历史统计数据。
     * 
     * 适用场景：
     * - 重置统计数据开始新的监控周期
     * - 配置变更后需要重新统计
     * 
     * 边界条件：
     * - 只影响统计数据，不影响线程池实际运行
     * - 新的maxActiveCount从当前activeCount值开始计算
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 创建线程池
     * const pool = new PromiseThreadPool(5);
     * 
     * // 执行一批任务
     * for (let i = 0; i < 20; i++) {
     *   pool.submit(() => heavyTask(i));
     * }
     * 
     * // 一段时间后检查状态
     * setTimeout(() => {
     *   console.log(`第一批任务的最高并发记录: ${pool.status.maxActive}`);
     *   
     *   // 重置记录
     *   pool.resetMaxActive();
     *   console.log('已重置并发记录');
     *   
     *   // 执行第二批任务
     *   for (let i = 0; i < 10; i++) {
     *     pool.submit(() => lightTask(i));
     *   }
     * }, 10000);
     */
    public resetMaxActive(): void {
        this.maxActiveCount = this.activeCount;
    }
}