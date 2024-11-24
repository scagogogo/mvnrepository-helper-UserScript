// 存储解析到的Jar包的JDK编译版本

const {getDatabase} = require("./database");

const NAME = "gav-jar-information-storage";

/**
 * 表示一个GAV的Jar信息
 */
class GavJarInformation {

    constructor() {

        self.id = null;

        self.groupId = null;
        self.artifactId = null;
        self.version = null;

        // 对manifest的检测
        self.manifestDetectDone = false;
        self.manifest = null;

        // 对jar中的class的解析
        self.jarClassDetectDone = false;
        self.metric = null;
        self.maxMajorVersion = null;
        self.maxMinorVersion = null;

    }

}

/**
 * 保存
 *
 * @param jarInformation {GavJarInformation}
 */
async function saveGavJarInformation(jarInformation) {

    jarInformation.id = buildId(jarInformation.groupId, jarInformation.artifactId, jarInformation.version);
    const request = await getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(jarInformation);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };
}

/**
 * 更新数据库中的 GavJar 信息
 *
 * @param {GavJarInformation} jarInformation - 包含 groupId, artifactId 和 version 的对象
 */
async function updateGavJarInformation(jarInformation) {

    // 验证 jarInformation 对象是否包含必要的属性
    if (!jarInformation || !jarInformation.groupId || !jarInformation.artifactId) {
        throw new Error('Invalid jarInformation object');
    }

    // 构建数据库记录的唯一标识符
    jarInformation.id = buildId(jarInformation.groupId, jarInformation.artifactId, jarInformation.version);
    debugger;
    const request = await getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(jarInformation);

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
 * @param groupId
 * @param artifactId
 * @param version
 */
async function findGavJarInformation(groupId, artifactId, version) {
    const id = buildId(groupId, artifactId, version);
    return await getDatabase().transaction([NAME], "readonly").objectStore(NAME).get(id);
}

/**
 * 生成数据库ID
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @returns {string}
 */
function buildId(groupId, artifactId, version) {
    return `${groupId}:${artifactId}:${version}`;
}

module.exports = {
    saveGavJarInformation,
    findGavJarInformation,
    updateGavJarInformation,
    GavJarInformation
}
