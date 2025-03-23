import {IDBPDatabase, openDB} from "idb";
import {logger} from "../logger/Logger";

// 数据库名称常量（类型自动推断为字符串）
const DATABASE_NAME = "mvnrepository-helper-UserScript";
// 数据库版本常量（类型自动推断为数字）
const DATABASE_SCHEMA_VERSION = 3;

/**
 * IndexedDB 数据库操作封装类
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
 */
export default class Database {
    /** 数据库实例缓存 */
    private static database: IDBPDatabase<any> | null = null;

    /**
     * 初始化数据库连接
     *
     * @returns {Promise<void>} 初始化完成的Promise
     *
     * @throws {Error} 数据库初始化失败时抛出异常
     *
     * 实现细节：
     * 1. 使用idb库的openDB方法创建/升级数据库
     * 2. 自动创建三个对象存储空间（如果不存在）：
     *    - gav-jar-information-storage
     *    - repo-information-storage
     *    - settings
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
     * @returns {IDBPDatabase} 数据库实例
     *
     * @throws {Error} 如果数据库未初始化时调用会抛出异常
     *
     * 典型使用场景：
     * @example
     * const db = Database.getDatabase();
     * const transaction = db.transaction('settings', 'readonly');
     * const value = await transaction.objectStore('settings').get('concurrency');
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
     * // 计算 settings 存储空间大小
     * Database.calculateObjectStoreSize('settings')
     *   .then(size => console.log(`存储空间占用: ${(size / 1024).toFixed(2)} KB`))
     *   .catch(error => console.error(error));
     *
     * @param storeName 要计算的对象存储名称
     * @returns Promise 解析为存储空间的总字节数
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
     * @param obj 要计算的对象
     * @returns 字节大小
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