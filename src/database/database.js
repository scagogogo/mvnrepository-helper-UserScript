// 打开数据库，如果不存在则创建
const {openDB} = require("idb");
let database;

// 使用这个库，它把indexed的API都包装为Promise形式的了：
// https://github.com/jakearchibald/idb

const DATABASE_NAME = "mvnrepository-helper-UserScript";

// 2025-02-15 16:33:50 数据库的结构变更的时候，此处的版本号要随之增加
const DATABASE_SCHEMA_VERSION = 3;

/**
 * 初始化数据库
 *
 * @returns {Promise<void>}
 */
async function initDatabase() {
    try {
        database = await openDB(DATABASE_NAME, DATABASE_SCHEMA_VERSION, {
            upgrade(database, oldVersion, newVersion, transaction, event) {
                if (!database.objectStoreNames.contains("gav-jar-information-storage")) {
                    database.createObjectStore("gav-jar-information-storage", {keyPath: "id"});
                }
                if (!database.objectStoreNames.contains("repo-information-storage")) {
                    database.createObjectStore("repo-information-storage", {keyPath: "id"});
                }
                if (!database.objectStoreNames.contains("settings")) {
                    database.createObjectStore("settings", {keyPath: "id"});
                }
            }
        });
    } catch (error) {
        console.error("数据库初始化失败:", error);
        throw error;
    }
}

/**
 * 获取数据库对象
 *
 * @returns {*}
 */
function getDatabase() {
    if (!database) {
        throw new Error("数据库尚未初始化，请先调用 initDatabase()");
    }
    return database;
}

module.exports = {
    initDatabase,
    getDatabase
};

