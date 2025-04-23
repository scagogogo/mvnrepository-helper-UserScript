import {IDBPDatabase, openDB} from "idb";
import {logger} from "../logger/Logger";

// 数据库名称常量（类型自动推断为字符串）
const DATABASE_NAME = "mvnrepository-helper-UserScript";
// 数据库版本常量（类型自动推断为数字）
const DATABASE_SCHEMA_VERSION = 3;

/**
 * IndexedDB 数据库操作封装类
 * 
 * 本类提供了对浏览器IndexedDB的封装，简化数据库操作流程，支持异步事务处理。
 * 主要用于存储Maven仓库相关的信息、JAR包数据以及用户设置。
 * 
 * 注意事项：
 * - 使用前必须先调用initDatabase()初始化数据库连接
 * - 所有方法都是静态的，无需实例化该类
 * - 线程安全说明：IndexedDB原生支持事务并发控制
 * 
 * 使用示例：
 * @example
 * // 初始化数据库
 * await Database.initDatabase();
 *
 * // 获取数据库实例
 * const db = Database.getDatabase();
 *
 * // 执行事务
 * const tx = db.transaction('settings', 'readwrite');
 * const store = tx.objectStore('settings');
 * await store.put({ id: 'concurrency', value: 5 });
 * 
 * // 读取设置
 * const tx2 = db.transaction('settings', 'readonly');
 * const store2 = tx2.objectStore('settings');
 * const concurrencySetting = await store2.get('concurrency');
 * console.log(`当前并发设置: ${concurrencySetting?.value || '默认值'}`);
 */
export default class Database {
    /**
     * 数据库实例缓存
     * 
     * 用于存储已初始化的IndexedDB数据库连接对象
     * 初始值为null，在调用initDatabase()后被赋值
     * 该字段为私有静态字段，只能通过getDatabase()方法访问
     */
    private static database: IDBPDatabase<any> | null = null;

    /**
     * 初始化数据库连接
     * 
     * 本方法负责创建或打开IndexedDB数据库连接，并在需要时自动升级数据库架构。
     * 如果是新创建的数据库或版本升级，会自动创建所需的对象存储空间。
     * 
     * 适用场景：
     * - 应用初始化时调用
     * - 数据库架构更新后调用（修改了DATABASE_SCHEMA_VERSION常量）
     * 
     * 性能特性：
     * - 首次调用可能较慢，特别是在需要创建数据库时
     * - 后续调用或连接已存在的数据库通常较快
     * 
     * @returns {Promise<void>} 初始化完成的Promise，不包含返回值
     * 
     * @throws {Error} 数据库初始化失败时抛出异常，异常信息包含具体错误原因
     *                 常见错误：浏览器不支持IndexedDB、用户拒绝授权、磁盘空间不足
     * 
     * 实现细节：
     * 1. 使用idb库的openDB方法创建/升级数据库
     * 2. 自动创建三个对象存储空间（如果不存在）：
     *    - gav-jar-information-storage：存储JAR包信息
     *    - repo-information-storage：存储仓库信息
     *    - settings：存储用户设置
     * 
     * 使用示例：
     * @example
     * // 基本用法
     * try {
     *   await Database.initDatabase();
     *   console.log('数据库初始化成功');
     * } catch (error) {
     *   console.error('数据库初始化失败:', error);
     * }
     * 
     * // 在React组件中使用
     * useEffect(() => {
     *   const initDb = async () => {
     *     try {
     *       await Database.initDatabase();
     *       setDbStatus('已连接');
     *     } catch (error) {
     *       setDbStatus('连接失败');
     *       setError(error.message);
     *     }
     *   };
     *   initDb();
     * }, []);
     */
    static async initDatabase(): Promise<void> {
        try {
            this.database = await openDB<any>(DATABASE_NAME, DATABASE_SCHEMA_VERSION, {
                upgrade: (
                    database: IDBPDatabase<any>,
                    oldVersion: number,
                    newVersion: number | null
                ) => {
                    // 创建对象存储空间的逻辑
                    const requiredStores = [
                        "gav-jar-information-storage",
                        "repo-information-storage",
                        "settings"
                    ];

                    requiredStores.forEach(storeName => {
                        if (!database.objectStoreNames.contains(storeName)) {
                            database.createObjectStore(storeName, {keyPath: "id"});
                            logger.debug(`创建store: ${storeName}`);
                        }
                    });
                }
            });
        } catch (error) {
            logger.error("数据库初始化失败:", error);
            throw new Error(`数据库初始化失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 获取已初始化的数据库实例
     * 
     * 本方法返回已初始化的IndexedDB数据库连接对象，用于执行数据库操作。
     * 必须在调用initDatabase()之后才能使用，否则会抛出异常。
     * 
     * 适用场景：
     * - 需要执行数据库事务时使用
     * - 需要直接访问数据库对象存储空间时使用
     * 
     * 性能特性：
     * - 方法执行速度快，仅做空值检查并返回缓存的数据库实例
     * - 不会创建新的数据库连接
     * 
     * @returns {IDBPDatabase<any>} 数据库实例对象，可用于创建事务和访问对象存储空间
     * 
     * @throws {Error} 如果数据库未初始化（即先前未调用initDatabase()或调用失败）时抛出异常
     *                 异常信息："数据库尚未初始化，请先调用 initDatabase()"
     * 
     * 典型使用场景：
     * @example
     * // 基本用法
     * try {
     *   const db = Database.getDatabase();
     *   const transaction = db.transaction('settings', 'readonly');
     *   const value = await transaction.objectStore('settings').get('concurrency');
     *   console.log('当前并发设置:', value);
     * } catch (error) {
     *   console.error('获取数据库实例失败:', error);
     * }
     * 
     * // 写入数据示例
     * try {
     *   const db = Database.getDatabase();
     *   const tx = db.transaction('settings', 'readwrite');
     *   await tx.objectStore('settings').put({
     *     id: 'theme',
     *     value: 'dark',
     *     lastUpdated: new Date().toISOString()
     *   });
     *   await tx.done; // 等待事务完成
     *   console.log('主题设置已保存');
     * } catch (error) {
     *   console.error('保存设置失败:', error);
     * }
     */
    static getDatabase(): IDBPDatabase<any> {
        if (!this.database) {
            const errorMsg = "数据库尚未初始化，请先调用 initDatabase()";
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }
        return this.database as IDBPDatabase<any>;
    }

    /**
     * 计算指定对象存储空间的总大小
     * 
     * 本方法通过遍历对象存储空间中的所有记录，计算其JSON序列化后的总字节大小。
     * 可用于监控数据库占用空间或优化存储策略。
     * 
     * 适用场景：
     * - 需要监控数据库空间占用时
     * - 在清理数据前了解各存储空间大小
     * - 性能调优时分析数据存储情况
     * 
     * 性能特性：
     * - 对于包含大量记录的存储空间，该方法可能比较耗时
     * - 内存使用：遍历过程中不会一次性加载所有数据到内存，而是通过游标逐条处理
     * 
     * @param {string} storeName 要计算的对象存储名称，必须是已存在的存储空间名称
     *                          例如："settings"、"gav-jar-information-storage"或"repo-information-storage"
     * 
     * @returns {Promise<number>} Promise 解析为存储空间的总字节数（单位：字节）
     *                           可能的返回值范围：0 ~ 数十MB（取决于存储的数据量）
     * 
     * @throws {Error} 计算过程中出错时抛出异常，如：
     *                - 指定的存储空间不存在
     *                - 数据库连接未初始化
     *                - 访问权限问题
     * 
     * 使用示例：
     * @example
     * // 基本用法 - 计算并显示KB单位的大小
     * try {
     *   const sizeInBytes = await Database.calculateObjectStoreSize('settings');
     *   console.log(`设置存储占用空间: ${(sizeInBytes / 1024).toFixed(2)} KB`);
     * } catch (error) {
     *   console.error('计算存储空间大小失败:', error);
     * }
     * 
     * // 计算所有存储空间并比较
     * async function analyzeStorageSizes() {
     *   const stores = ['settings', 'gav-jar-information-storage', 'repo-information-storage'];
     *   const results = {};
     *   
     *   for (const store of stores) {
     *     try {
     *       results[store] = await Database.calculateObjectStoreSize(store);
     *     } catch (error) {
     *       results[store] = `错误: ${error.message}`;
     *     }
     *   }
     *   
     *   console.table(results);
     * }
     */
    static async calculateObjectStoreSize(storeName: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const db = this.getDatabase();
                let totalSize = 0;

                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);

                // 使用游标遍历所有对象
                let cursor = await store.openCursor();
                while (cursor) {
                    totalSize += this.calculateSize(cursor.value);
                    cursor = await cursor.continue();
                }

                resolve(totalSize);
            } catch (error) {
                logger.error("计算存储空间大小失败:", error);
                reject(new Error(`计算失败: ${error instanceof Error ? error.message : String(error)}`));
            }
        });
    }

    /**
     * 计算对象序列化后的字节大小（私有方法）
     * 
     * 本方法用于计算JavaScript对象序列化为JSON后的字节大小。
     * 主要作为calculateObjectStoreSize方法的辅助函数使用。
     * 
     * 工作原理：
     * 1. 将输入对象序列化为JSON字符串
     * 2. 创建包含该字符串的Blob对象
     * 3. 返回Blob的size属性值（字节数）
     * 
     * 性能特性：
     * - 对于大型对象，序列化过程可能较为耗时
     * - 内存使用：会临时创建JSON字符串和Blob对象
     * 
     * 错误处理：
     * - 序列化失败时（如对象包含循环引用）会捕获异常并返回0
     * - 序列化错误会被记录到日志但不会抛出
     * 
     * @param {unknown} obj 要计算大小的对象，可以是任何可序列化的JavaScript值
     *                     包括：对象、数组、字符串、数字、布尔值、null
     *                     不包括：函数、Symbol、包含循环引用的对象
     * 
     * @returns {number} 对象序列化后的字节大小
     *                  可能的返回值：
     *                  - 成功时：对象的实际字节大小（≥0）
     *                  - 失败时：0
     * 
     * 内部使用示例：
     * @example
     * // 简单对象
     * const size1 = this.calculateSize({ id: 'test', value: 123 });
     * // 输出约为 25字节
     * 
     * // 复杂对象
     * const size2 = this.calculateSize({
     *   id: 'complex',
     *   data: new Array(1000).fill('test'),
     *   metadata: { created: new Date().toISOString() }
     * });
     * // 输出取决于数据结构，可能为几KB
     */
    private static calculateSize(obj: unknown): number {
        try {
            const jsonString = JSON.stringify(obj);
            return new Blob([jsonString]).size;
        } catch (error) {
            logger.error("对象序列化失败:", error);
            return 0;
        }
    }

}