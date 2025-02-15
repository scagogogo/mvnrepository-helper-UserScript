const {Database} = require("./Database");

const NAME = "gav-jar-information-storage";

/**
 * 表示一个GAV的Jar信息
 */
class GavJarInformation {

    constructor() {
        // GAV加起来组成的ID
        this.id = null;

        this.groupId = null;
        this.artifactId = null;
        this.version = null;

        // 对manifest的检测
        this.manifestDetectDone = false;
        this.manifest = null;

        // 对jar中的class的解析
        this.jarClassDetectDone = false;
        this.metric = null;
        this.maxMajorVersion = null;
        this.maxMinorVersion = null;
    }
}

/**
 * 用于存储和检索GAV Jar信息的类
 */
class GavJarInformationStorage {
    /**
     * 保存一个Jar包的信息
     *
     * @param {GavJarInformation} jarInformation - 包含 groupId, artifactId 和 version 的对象
     */
    static async saveGavJarInformation(jarInformation) {
        jarInformation.id = this.buildId(jarInformation.groupId, jarInformation.artifactId, jarInformation.version);
        const request = await Database.getDatabase().transaction([NAME], "readwrite")
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
    static async updateGavJarInformation(jarInformation) {
        // 验证 jarInformation 对象是否包含必要的属性
        if (!jarInformation || !jarInformation.groupId || !jarInformation.artifactId) {
            throw new Error('Invalid jarInformation object');
        }

        // 构建数据库记录的唯一标识符
        jarInformation.id = this.buildId(jarInformation.groupId, jarInformation.artifactId, jarInformation.version);
        const request = await Database.getDatabase().transaction([NAME], "readwrite")
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
     * 读取GAV Jar信息
     *
     * @param {string} groupId - 组ID
     * @param {string} artifactId - 构件ID
     * @param {string} version - 版本
     * @returns {Promise<GavJarInformation>} - 返回GavJarInformation对象
     */
    static async findGavJarInformation(groupId, artifactId, version) {
        const id = this.buildId(groupId, artifactId, version);
        return await Database.getDatabase().transaction([NAME], "readonly").objectStore(NAME).get(id);
    }

    /**
     * 生成数据库ID
     *
     * @param {string} groupId - 组ID
     * @param {string} artifactId - 构件ID
     * @param {string} version - 版本
     * @returns {string} - 生成的ID
     */
    static buildId(groupId, artifactId, version) {
        return `${groupId}:${artifactId}:${version}`;
    }
}

module.exports = {
    GavJarInformation,
    GavJarInformationStorage
};