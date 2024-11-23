// 打开数据库，如果不存在则创建
let database;
let request = indexedDB.open("mvnrepository-helper-UserScript", 1);

request.onerror = function (event) {
    console.log("Database error: " + event.target.errorCode);
};

request.onsuccess = function (event) {
    database = event.target.result;
    console.log("Database opened successfully");
};

request.onupgradeneeded = function (event) {
    database = event.target.result;
    database.createObjectStore("gav-manifest-storage", {keyPath: "id"});
    database.createObjectStore("gav-jar-jdk-version-storage", {keyPath: "id"});
};

module.exports = database;

