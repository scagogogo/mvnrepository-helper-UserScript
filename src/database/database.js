// 打开数据库，如果不存在则创建
const {openDB} = require("idb");
let database;

// 使用这个库，它把indexed的API都包装为Promise形式的了：
// https://github.com/jakearchibald/idb

/**
 * 初始化数据库
 *
 * @returns {Promise<void>}
 */
async function initDatabase() {
    database = await openDB("mvnrepository-helper-UserScript", 1, {
        upgrade(database, oldVersion, newVersion, transaction, event) {
            database.createObjectStore("gav-jar-information-storage", {keyPath: "id"});
        }
    });
}

/**
 * 获取数据库对象
 *
 * @returns {*}
 */
function getDatabase() {
    return database;
}

module.exports = {
    initDatabase,
    getDatabase
};

