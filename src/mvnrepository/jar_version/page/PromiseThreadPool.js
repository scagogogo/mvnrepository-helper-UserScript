class PromiseThreadPool {
    constructor(maxConcurrency = 4) {
        this.maxConcurrency = maxConcurrency
        this.activeCount = 0
        this.queue = []
        this.paused = false
    }

    // 核心提交方法（支持三种传参方式）
    submit(task) {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    let promise

                    // 处理不同任务类型
                    if (typeof task === 'function') {
                        promise = task()  // 执行函数获取promise
                    } else if (task instanceof Promise) {
                        promise = task    // 直接使用已有promise
                    } else {
                        throw new Error('Invalid task type')
                    }

                    const result = await promise
                    resolve(result)
                } catch (error) {
                    reject(error)
                } finally {
                    this.activeCount--
                    this._next()
                }
            }

            this.queue.push(wrappedTask)
            !this.paused && this._next()
        })
    }

    // 执行控制逻辑
    _next() {
        while (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
            this.activeCount++
            const task = this.queue.shift()
            task().catch(() => {}) // 防止未处理的rejection
        }
    }

    // 暂停任务执行
    pause() {
        this.paused = true
    }

    // 恢复任务执行
    resume() {
        this.paused = false
        this._next()
    }

    // 清空等待队列
    clear() {
        this.queue = []
    }

    // 动态调整并发数
    setConcurrency(newMax) {
        this.maxConcurrency = newMax
        this._next()
    }

    // 状态监控
    get status() {
        return {
            running: this.activeCount,
            waiting: this.queue.length,
            maxConcurrency: this.maxConcurrency,
            paused: this.paused
        }
    }
}

module.exports = {
    PromiseThreadPool,
}

// // 1. 直接传递Promise对象
// const p1 = fetch('https://api.example.com/data')
//
// // 2. 传递返回Promise的函数
// const p2 = () => new Promise(resolve =>
//   setTimeout(() => resolve('延迟任务'), 1000))
//
// // 3. 传递async函数
// const p3 = async () => {
//   const res = await fetch('https://api.example.com/users')
//   return res.json()
// }
//
// const pool = new PromiseThreadPool(2)
//
// // 混合提交不同类型任务
// pool.submit(p1)
//   .then(data => console.log('Promise对象任务完成'))
//   .catch(console.error)
//
// pool.submit(p2)
//   .then(msg => console.log(msg))
//   .catch(console.error)
//
// pool.submit(p3)
//   .then(users => console.log('获取用户数据:', users))
//   .catch(console.error)