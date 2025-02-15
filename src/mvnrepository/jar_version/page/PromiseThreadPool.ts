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

export default class PromiseThreadPool {
    private maxConcurrency: number; // 最大并发数
    private activeCount: number;    // 当前活跃任务数
    private queue: Array<() => Promise<any>>; // 任务队列
    private paused: boolean;        // 是否暂停

    /**
     * 构造函数
     * @param maxConcurrency 最大并发数，默认为4
     */
    constructor(maxConcurrency: number) {
        this.maxConcurrency = maxConcurrency;
        this.activeCount = 0;
        this.queue = [];
        this.paused = false;
    }

    /**
     * 提交任务到线程池
     * @param task 任务，可以是Promise对象、返回Promise的函数或async函数
     * @returns Promise<any> 任务的Promise
     */
    public submit(task: () => Promise<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    const result = await task(); // 直接执行函数获取Promise
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.activeCount--;
                    this._next();
                }
            };

            this.queue.push(wrappedTask);
            !this.paused && this._next();
        });
    }

    /**
     * 执行下一个任务
     * @private
     */
    private _next(): void {
        while (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
            this.activeCount++;
            const task = this.queue.shift();
            task!().catch(() => {
            }); // 防止未处理的rejection
        }
    }

    /**
     * 暂停任务执行
     */
    public pause(): void {
        this.paused = true;
    }

    /**
     * 恢复任务执行
     */
    public resume(): void {
        this.paused = false;
        this._next();
    }

    /**
     * 清空等待队列
     */
    public clear(): void {
        this.queue = [];
    }

    /**
     * 动态调整并发数
     * @param newMax 新的最大并发数
     */
    public setConcurrency(newMax: number): void {
        this.maxConcurrency = newMax;
        this._next();
    }

    /**
     * 获取线程池状态
     * @returns {object} 线程池状态，包含running、waiting、maxConcurrency和paused
     */
    public get status(): { running: number; waiting: number; maxConcurrency: number; paused: boolean } {
        return {
            running: this.activeCount,
            waiting: this.queue.length,
            maxConcurrency: this.maxConcurrency,
            paused: this.paused
        };
    }

}