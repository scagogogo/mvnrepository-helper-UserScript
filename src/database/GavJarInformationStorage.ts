import Database from "./Database";

/** 存储空间名称常量 */
const STORE_NAME = "gav-jar-information-storage";

/**
 * GAV Jar信息实体类
 *
 * 属性说明：
 * @property {string | null} id - 由groupId:artifactId:version组成的唯一标识
 * @property {string | null} groupId - Maven Group ID
 * @property {string | null} artifactId - Maven Artifact ID
 * @property {string | null} version - 组件版本号
 * @property {boolean} manifestDetectDone - 清单文件检测完成标记
 * @property {any | null} manifest - 解析出的MANIFEST.MF信息
 * @property {boolean} jarClassDetectDone - class文件检测完成标记
 * @property {any | null} metric - 代码度量指标数据
 * @property {number | null} maxMajorVersion - class文件最大主版本号
 * @property {number | null} maxMinorVersion - class文件最大次版本号
 */
export class GavJarInformation {
    id: string | null = null;
    groupId: string | null = null;
    artifactId: string | null = null;
    version: string | null = null;
    manifestDetectDone: boolean = false;
    manifest: any | null = null;
    jarClassDetectDone: boolean = false;
    metric: any | null = null;
    maxMajorVersion: number | null = null;
    maxMinorVersion: number | null = null;
}

/**
 * GAV Jar信息存储管理类
 *
 * 使用示例：
 * @example
 * // 保存信息
 * const info = new GavJarInformation();
 * info.groupId = 'com.google.guava';
 * info.artifactId = 'guava';
 * info.version = '31.1-jre';
 * await GavJarInformationStorage.save(info);
 *
 * // 查询信息
 * const result = await GavJarInformationStorage.find('com.google.guava', 'guava', '31.1-jre');
 */
export default class GavJarInformationStorage {
    /**
     * 保存或更新Jar信息到数据库
     *
     * @param {GavJarInformation} data - 需要存储的Jar信息对象
     * @throws {Error} 当数据校验失败时抛出异常
     */
    static async save(data: GavJarInformation): Promise<void> {
        if (!data.groupId || !data.artifactId || !data.version) {
            throw new Error("缺少必要的GAV参数");
        }
        if (!data.groupId?.trim() || !data.artifactId?.trim() || !data.version?.trim()) {
            throw new Error("GAV参数不能为空");
        }

        data.id = this.buildId(data.groupId, data.artifactId, data.version);

        const transaction = Database.getDatabase().transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        await objectStore.put(data); // 直接使用 await
    }

    /**
     * 查询指定GAV的Jar信息
     *
     * @param {string} groupId - 组织标识
     * @param {string} artifactId - 构件标识
     * @param {string} version - 版本号
     * @returns {Promise<GavJarInformation | undefined>} 查询结果（未找到时返回undefined）
     */
    static async find(groupId: string, artifactId: string, version: string): Promise<GavJarInformation | undefined> {
        const id = this.buildId(groupId, artifactId, version);

        const transaction = Database.getDatabase().transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);
        const result = await objectStore.get(id); // 直接使用 await

        return result;
    }

    /**
     * 生成标准化ID（组合GAV参数）
     *
     * @param {string} groupId - 组织标识
     * @param {string} artifactId - 构件标识
     * @param {string} version - 版本号
     * @returns {string} 格式为 groupId:artifactId:version 的字符串
     *
     * @example
     * buildId('com.google', 'guava', '31.0') // 返回 'com.google:guava:31.0'
     */
    static buildId(groupId: string, artifactId: string, version: string): string {
        return `${groupId}:${artifactId}:${version}`;
    }
}