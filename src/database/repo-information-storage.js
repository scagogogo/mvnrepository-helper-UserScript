const {getDatabase} = require("./database");

const NAME = "repo-information-storage";

/**
 * 存储一个被索引的仓库的信息
 */
class RepoInformation {

    constructor() {

        // 在Maven中央仓库的详情页的链接
        self.id = null;

        // 基础url
        self.baseUrl = null;

    }

}

/**
 *
 * @param repoInformation {RepoInformation}
 * @returns {Promise<void>}
 */
async function saveRepoInformation(repoInformation) {

    const request = await getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(repoInformation);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };
}

/**
 *
 * @param {RepoInformation} repoInformation
 */
async function updateRepoInformation(repoInformation) {

    const request = await getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(repoInformation);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };

}

/**
 * 读取
 *
 * @param id
 */
async function findRepoInformation(id) {
    return await getDatabase().transaction([NAME], "readonly").objectStore(NAME).get(id);
}

module.exports = {
    RepoInformation,
    saveRepoInformation,
    updateRepoInformation,
    findRepoInformation
}
