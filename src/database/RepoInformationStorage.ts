import Database from "./Database";

/** 存储空间名称常量 */
const STORE_NAME = "repo-information-storage";

/**
 * 仓库信息实体类
 *
 * @property {string} id - 仓库唯一标识（对应Maven仓库详情页路径）
 * @property {string} baseUrl - 仓库基础URL地址
 */
export class RepoInformation {
    id: string;
    baseUrl: string;

    constructor(id: string, baseUrl: string) {
        this.id = id;
        this.baseUrl = baseUrl;
    }
}

/**
 * 仓库信息存储管理类
 *
 * 使用示例：
 * @example
 * // 保存仓库信息
 * const repo = new RepoInformation('/repos/central', 'https://repo1.maven.org/maven2/');
 * await RepoInformationStorage.save(repo);
 *
 * // 查询仓库信息
 * const result = await RepoInformationStorage.find('/repos/central');
 */
export class RepoInformationStorage {
    /**
     * 保存或更新仓库信息
     *
     * @param {RepoInformation} data - 需要存储的仓库信息对象
     * @returns {Promise<void>} 操作完成的Promise
     *
     * @throws {Error} 当数据校验失败时抛出异常
     */
    static async save(data: RepoInformation): Promise<void> {
        if (!data.id || !data.baseUrl) {
            throw new Error("仓库信息缺少必要字段");
        }

        const transaction = Database.getDatabase().transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        await objectStore.put(data); // 直接使用 await
    }

    /**
     * 查询指定仓库信息
     *
     * @param {string} id - 仓库唯一标识
     * @returns {Promise<RepoInformation | undefined>} 查询结果（未找到时返回undefined）
     */
    static async find(id: string): Promise<RepoInformation | undefined> {
        const transaction = Database.getDatabase().transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);
        const result = await objectStore.get(id); // 直接使用 await

        return result;
    }

    /**
     * 初始化预置仓库数据
     *
     * @returns {Promise<void>} 初始化完成的Promise
     *
     * @example
     * // 预置数据包括：
     * // - Maven中央仓库
     * // - Atlassian第三方仓库
     * // - Geomajas仓库
     * // RedHat GA仓库
     * // JBoss第三方仓库
     */
    static async init(): Promise<void> {
        const exists = await this.find("/repos/central");
        if (exists) return;

        // TODO 初始化时兼容更多的仓库，以减少实时请求量
        const presets = [
            new RepoInformation("/repos/central", "https://repo1.maven.org/maven2/"),
            new RepoInformation("/repos/atlassian-3rdparty", "https://maven.atlassian.com/3rdparty/"),
            new RepoInformation("/repos/geomajas", "http://maven.geomajas.org/"),
            new RepoInformation("/repos/redhat-ga", "https://maven.repository.redhat.com/ga/"),
            new RepoInformation("/repos/jboss-thirdparty-releases",
                "https://repository.jboss.org/nexus/content/repositories/thirdparty-releases/")
        ];

        for (const repo of presets) {
            await this.save(repo);
        }
    }
}