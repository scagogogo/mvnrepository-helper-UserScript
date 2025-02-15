const {Database} = require("./Database");
const {resolveJarJdkVersion} = require("../mvnrepository/jar_version/detector/jar-jdk-version-detector");

const NAME = "repo-information-storage";

/**
 * 存储一个被索引的仓库的信息
 */
class RepoInformation {

    constructor(id, baseUrl) {

        // 在Maven中央仓库的详情页的链接
        this.id = id;

        // 基础url
        this.baseUrl = baseUrl;

    }

}

/**
 *
 * @param repoInformation {RepoInformation}
 * @returns {Promise<void>}
 */
async function saveRepoInformation(repoInformation) {

    const request = await Database.getDatabase().transaction([NAME], "readwrite")
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

    const request = await Database.getDatabase().transaction([NAME], "readwrite")
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
    return await Database.getDatabase().transaction([NAME], "readonly").objectStore(NAME).get(id);
}

/**
 * 对于已知的一些仓库，直接把数据初始化，这样也不必再发请求了，速度可以稍微快一些
 *
 * @returns {Promise<void>}
 */
async function initRepoInformation() {

    const repoInformation = await findRepoInformation("/repos/central");
    if (repoInformation) {
        return;
    }

    const repos = [
        new RepoInformation("/repos/central", "https://repo1.maven.org/maven2/"),
        new RepoInformation("/repos/atlassian-3rdparty", "https://maven.atlassian.com/3rdparty/"),
        new RepoInformation("/repos/geomajas", "http://maven.geomajas.org/"),
        new RepoInformation("/repos/redhat-ga", "https://maven.repository.redhat.com/ga/"),
        new RepoInformation("/repos/jboss-thirdparty-releases", "https://repository.jboss.org/nexus/content/repositories/thirdparty-releases/"),
    ];
    for (let repoInformation of repos) {
        await saveRepoInformation(repoInformation);
    }
}

module.exports = {
    RepoInformation,
    saveRepoInformation,
    updateRepoInformation,
    findRepoInformation,
    initRepoInformation
}
