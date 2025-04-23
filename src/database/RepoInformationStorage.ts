import Database from "./Database";

/**
 * Maven仓库信息存储的对象存储空间名称常量
 * 
 * 用于在IndexedDB数据库中标识存储仓库信息的对象存储空间
 * 该常量值为"repo-information-storage"，在创建数据库时会自动创建此存储空间
 */
const STORE_NAME = "repo-information-storage";

/**
 * Maven仓库信息实体类
 * 
 * 用于表示Maven仓库的基本信息，包括仓库标识和访问地址
 * 每个仓库信息对象都会被持久化到IndexedDB数据库中
 * 
 * 主要用途：
 * - 存储常用Maven仓库的基础URL
 * - 建立仓库路径与实际下载地址的映射关系
 * - 支持脚本在不同仓库间快速切换和获取依赖
 * 
 * 数据结构说明：
 * - id: 仓库的唯一标识，通常是mvnrepository.com上的仓库路径
 * - baseUrl: 仓库的实际访问基础URL，用于构建JAR包下载链接
 * 
 * @property {string} id - 仓库唯一标识（对应Maven仓库详情页路径）
 *                       例如："/repos/central"表示Maven中央仓库
 *                       此字段作为IndexedDB中的keyPath使用
 * 
 * @property {string} baseUrl - 仓库基础URL地址
 *                            例如："https://repo1.maven.org/maven2/"
 *                            必须以斜杠'/'结尾
 */
export class RepoInformation {
    /**
     * 仓库唯一标识
     * 
     * 对应mvnrepository.com上的仓库路径
     * 作为数据库中的主键(keyPath)
     * 示例值："/repos/central", "/repos/jboss-thirdparty-releases"
     */
    id: string;
    
    /**
     * 仓库基础URL地址
     * 
     * 用于构建JAR包的完整下载链接
     * 必须以斜杠'/'结尾，否则拼接路径时可能出错
     * 示例值："https://repo1.maven.org/maven2/"
     */
    baseUrl: string;

    /**
     * 创建仓库信息对象
     * 
     * 初始化一个新的仓库信息实例，设置其ID和基础URL
     * 
     * @param {string} id - 仓库唯一标识
     *                    - 必填项，通常是mvnrepository.com上的仓库路径
     *                    - 例如："/repos/central"表示Maven中央仓库
     * 
     * @param {string} baseUrl - 仓库基础URL地址
     *                         - 必填项，用于构建JAR包下载链接的基础URL
     *                         - 必须以斜杠'/'结尾
     *                         - 例如："https://repo1.maven.org/maven2/"
     * 
     * 使用示例：
     * @example
     * // 创建Maven中央仓库信息
     * const centralRepo = new RepoInformation(
     *   "/repos/central", 
     *   "https://repo1.maven.org/maven2/"
     * );
     * 
     * // 创建JBoss第三方仓库信息
     * const jbossRepo = new RepoInformation(
     *   "/repos/jboss-thirdparty-releases",
     *   "https://repository.jboss.org/nexus/content/repositories/thirdparty-releases/"
     * );
     */
    constructor(id: string, baseUrl: string) {
        this.id = id;
        this.baseUrl = baseUrl;
    }
}

/**
 * Maven仓库信息存储管理类
 * 
 * 提供对Maven仓库信息的存储、查询和初始化功能
 * 使用IndexedDB作为持久化存储，支持异步操作
 * 
 * 主要功能：
 * - 保存/更新仓库信息
 * - 查询特定仓库信息
 * - 初始化预置仓库数据
 * 
 * 设计特点：
 * - 所有方法都是静态的，无需实例化
 * - 使用异步Promise接口，支持现代JavaScript异步模式
 * - 预置了常用Maven仓库的信息，减少网络请求
 * 
 * 性能考虑：
 * - 仓库信息数量有限，存储空间占用小
 * - 查询操作使用只读事务，性能开销小
 * - 初始化操作仅在首次使用时执行
 * 
 * 使用场景：
 * - 构建JAR包下载链接时获取仓库基础URL
 * - 支持多仓库并发检索依赖
 * - 避免硬编码仓库URL，提高可维护性
 * 
 * 使用示例：
 * @example
 * // 初始化仓库数据（应用启动时调用）
 * await RepoInformationStorage.init();
 * 
 * // 保存新的仓库信息
 * const repo = new RepoInformation(
 *   '/repos/spring-releases', 
 *   'https://repo.spring.io/release/'
 * );
 * await RepoInformationStorage.save(repo);
 *
 * // 查询仓库信息
 * const centralRepo = await RepoInformationStorage.find('/repos/central');
 * if (centralRepo) {
 *   console.log(`中央仓库URL: ${centralRepo.baseUrl}`);
 *   
 *   // 构建某个JAR包的下载链接
 *   const jarPath = 'org/springframework/spring-core/5.3.20/spring-core-5.3.20.jar';
 *   const downloadUrl = `${centralRepo.baseUrl}${jarPath}`;
 *   console.log(`下载链接: ${downloadUrl}`);
 * }
 */
export class RepoInformationStorage {
    /**
     * 保存或更新仓库信息
     * 
     * 将仓库信息对象持久化到IndexedDB中
     * 如果指定ID的仓库已存在，则更新其信息
     * 
     * 数据验证：
     * - 确保id和baseUrl字段不为空
     * - 不验证baseUrl的格式和可访问性
     * 
     * 事务处理：
     * - 使用"readwrite"事务模式确保数据完整性
     * - 异步操作，不会阻塞UI线程
     * 
     * @param {RepoInformation} data - 需要存储的仓库信息对象
     *                              - 必须是RepoInformation类的实例
     *                              - id和baseUrl字段必须有值
     * 
     * @returns {Promise<void>} 操作完成的Promise
     *                        - 成功：Promise解析为undefined
     *                        - 失败：Promise拒绝并提供错误信息
     *
     * @throws {Error} 当数据校验失败时抛出异常
     *               - "仓库信息缺少必要字段"：id或baseUrl为空
     *               - 其他数据库操作相关异常
     * 
     * 使用示例：
     * @example
     * // 保存新仓库信息
     * try {
     *   const newRepo = new RepoInformation(
     *     '/repos/google', 
     *     'https://maven.google.com/'
     *   );
     *   await RepoInformationStorage.save(newRepo);
     *   console.log('Google仓库信息保存成功');
     * } catch (error) {
     *   console.error('保存仓库信息失败:', error);
     * }
     * 
     * // 更新已有仓库的URL
     * try {
     *   const repo = await RepoInformationStorage.find('/repos/central');
     *   if (repo) {
     *     repo.baseUrl = 'https://repo2.maven.org/maven2/'; // 使用镜像地址
     *     await RepoInformationStorage.save(repo);
     *     console.log('中央仓库URL已更新');
     *   }
     * } catch (error) {
     *   console.error('更新仓库信息失败:', error);
     * }
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
     * 根据仓库ID从数据库中检索仓库信息
     * 如果仓库不存在，则返回undefined
     * 
     * 性能特性：
     * - 使用"readonly"事务模式，多个查询可并发执行
     * - 查询速度快，通常在几毫秒内完成
     * 
     * 注意事项：
     * - 调用前需确保Database已初始化
     * - 如果仓库不存在，返回undefined而非抛出异常
     *
     * @param {string} id - 仓库唯一标识
     *                    - 必填项，通常是mvnrepository.com上的仓库路径
     *                    - 例如："/repos/central"表示Maven中央仓库
     * 
     * @returns {Promise<RepoInformation | undefined>} 查询结果
     *                                               - 成功找到：Promise解析为RepoInformation对象
     *                                               - 未找到：Promise解析为undefined
     *                                               - 查询失败：Promise拒绝并提供错误信息
     * 
     * 使用示例：
     * @example
     * // 基本查询用法
     * try {
     *   const repo = await RepoInformationStorage.find('/repos/central');
     *   if (repo) {
     *     console.log(`仓库基础URL: ${repo.baseUrl}`);
     *   } else {
     *     console.log('仓库信息不存在，可能需要初始化');
     *   }
     * } catch (error) {
     *   console.error('查询仓库信息失败:', error);
     * }
     * 
     * // 结合其他操作的用法
     * async function getJarDownloadUrl(repoId, groupId, artifactId, version) {
     *   const repo = await RepoInformationStorage.find(repoId);
     *   if (!repo) {
     *     throw new Error(`未找到仓库信息: ${repoId}`);
     *   }
     *   
     *   // 构建JAR包路径
     *   const groupPath = groupId.replace(/\./g, '/');
     *   const jarName = `${artifactId}-${version}.jar`;
     *   const jarPath = `${groupPath}/${artifactId}/${version}/${jarName}`;
     *   
     *   // 返回完整下载URL
     *   return `${repo.baseUrl}${jarPath}`;
     * }
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
     * 在数据库为空时，预先填充常用Maven仓库的信息
     * 如果数据库中已有数据（检查中央仓库是否存在），则跳过初始化
     * 
     * 预置数据包括以下仓库：
     * - Maven中央仓库（repo1.maven.org）
     * - Atlassian第三方仓库（maven.atlassian.com）
     * - Geomajas仓库（maven.geomajas.org）
     * - RedHat GA仓库（maven.repository.redhat.com）
     * - JBoss第三方仓库（repository.jboss.org）
     * 
     * 初始化策略：
     * - 检查中央仓库是否已存在，存在则认为已初始化
     * - 批量保存所有预置仓库信息
     * - 每个仓库保存为独立事务，避免单个失败影响整体
     * 
     * 性能影响：
     * - 仅在首次使用时执行一次
     * - 数据量较小，通常在几百毫秒内完成
     *
     * @returns {Promise<void>} 初始化完成的Promise
     *                        - 成功：Promise解析为undefined
     *                        - 初始化跳过（已有数据）：Promise解析为undefined
     *                        - 失败：Promise拒绝并提供错误信息
     * 
     * 使用示例：
     * @example
     * // 应用启动时调用
     * try {
     *   await RepoInformationStorage.init();
     *   console.log('仓库信息初始化完成');
     * } catch (error) {
     *   console.error('仓库信息初始化失败:', error);
     * }
     * 
     * // 在应用初始化流程中调用
     * async function initializeApp() {
     *   await Database.initDatabase();
     *   await RepoInformationStorage.init();
     *   console.log('应用数据初始化完成');
     * }
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