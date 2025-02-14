function calculateObjectStoreSize(databaseName, storeName) {
    return new Promise((resolve, reject) => {
        let totalSize = 0;

        // 打开数据库
        const request = indexedDB.open(databaseName);
        request.onerror = () => reject(request.error);

        request.onsuccess = (event) => {
            const db = event.target.result;

            // 开始只读事务
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);

            // 打开游标遍历所有对象
            const cursorRequest = store.openCursor();
            cursorRequest.onerror = () => reject(cursorRequest.error);

            cursorRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    // 计算当前对象的大小
                    const objectSize = calculateSize(cursor.value);
                    totalSize += objectSize;
                    cursor.continue(); // 继续下一个对象
                } else {
                    // 游标遍历完毕，返回总大小
                    resolve(totalSize);
                }
            };
        };
    });
}

// 计算对象序列化后的字节数
function calculateSize(obj) {
    try {
        // 序列化为JSON字符串
        const jsonString = JSON.stringify(obj);
        // 使用Blob获取精确字节大小
        return new Blob([jsonString]).size;
    } catch (error) {
        // 处理无法序列化的对象（如包含循环引用）
        console.error("对象序列化失败:", error);
        return 0;
    }
}

// // 使用示例
// calculateObjectStoreSize('myDatabase', 'myStore')
//     .then(size => console.log(`占用空间: ${size} 字节`))
//     .catch(error => console.error('计算失败:', error));

module.exports = {
    calculateObjectStoreSize,
}