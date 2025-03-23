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
    private maxConcurrency: number; // 最大并发数
    private activeCount: number;    // 当前活跃任务数
    private queue: Array<() => Promise<any>>; // 任务队列
    private paused: boolean;        // 是否暂停
    private maxActiveCount: number; // 记录最大实际并发数

    /**
     * 构造函数
     * @param maxConcurrency 最大并发数，默认为4
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
     * @param task 任务，可以是Promise对象、返回Promise的函数或async函数
     * @returns Promise<any> 任务的Promise
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
     * @private
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
     */
    public resetMaxActive(): void {
        this.maxActiveCount = this.activeCount;
    }
}