import Database from "./Database";

/**
 * 设置存储的对象存储空间名称常量
 * 
 * 用于在IndexedDB中标识存储设置数据的对象存储空间
 */
const NAME: string = "settings";

/**
 * 设置记录的唯一标识符常量
 * 
 * 用于在对象存储空间中标识设置记录的ID
 * 当前设计中只存储一条设置记录，因此使用固定ID
 */
const ID: string = "settings";

/**
 * 用户设置管理类
 * 
 * 负责管理和持久化存储用户设置数据，如并发请求数等配置
 * 通过IndexedDB实现数据持久化，使设置在页面刷新后仍然有效
 * 
 * 主要功能：
 * - 创建默认设置
 * - 保存设置到IndexedDB
 * - 从IndexedDB读取设置
 * - 更新已有设置
 * 
 * 存储结构：
 * - 使用单一记录存储所有设置
 * - 记录ID固定为"settings"
 * - 存储在"settings"对象存储空间中
 * 
 * 使用示例：
 * @example
 * // 创建并保存新设置
 * const newSettings = new Settings(5); // 设置并发数为5
 * await Settings.save(newSettings);
 * 
 * // 读取现有设置
 * try {
 *   const settings = await Settings.findSettings();
 *   console.log(`当前并发数: ${settings.concurrency}`);
 * } catch (error) {
 *   console.error('读取设置失败:', error);
 * }
 */
export default class Settings {
    /**
     * 设置存储的对象存储空间名称
     * 
     * 静态常量，用于指定IndexedDB中存储设置的对象存储空间
     * 值为"settings"
     */
    static STORE_NAME = NAME;
    
    /**
     * 设置记录的唯一键
     * 
     * 静态常量，用于在对象存储空间中标识设置记录
     * 值为"settings"
     */
    static KEY = ID;

    /**
     * 设置记录的唯一标识符
     * 
     * 该字段对应IndexedDB中的keyPath
     * 固定值为Settings.KEY ("settings")
     */
    id: string;
    
    /**
     * 并发请求数设置
     * 
     * 控制同时发起的网络请求最大数量
     * 取值范围：正整数（推荐1-10）
     * 默认值：3
     * 
     * 影响：
     * - 值越大，请求处理速度越快，但可能增加浏览器和服务器负担
     * - 值越小，对服务器压力越小，但处理速度会变慢
     */
    concurrency: number;

    /**
     * 创建设置对象实例
     * 
     * 初始化一个新的设置对象，可以指定并发数或使用默认值
     * 
     * @param {number} [concurrency] - 可选的并发请求数
     *                               - 如果不提供，将使用默认值3
     *                               - 推荐范围：1-10
     * 
     * 使用示例：
     * @example
     * // 使用默认并发数(3)创建设置
     * const defaultSettings = new Settings();
     * 
     * // 创建自定义并发数的设置
     * const customSettings = new Settings(5);
     */
    constructor(concurrency?: number) {
        this.id = Settings.KEY;
        this.concurrency = concurrency ?? 3;
    }

    /**
     * 保存设置到数据库
     * 
     * 将设置对象持久化存储到IndexedDB中
     * 如果已存在同ID的设置，将被覆盖
     * 
     * 功能特性：
     * - 使用"readwrite"事务模式确保写入安全
     * - 异步操作，不会阻塞UI线程
     * - 自动处理并发访问和事务冲突
     * 
     * 注意事项：
     * - 调用前需确保Database已初始化
     * - 操作失败会抛出异常
     *
     * @param {Settings} settings - 要保存的配置对象实例
     *                            - 必须是Settings类的实例
     *                            - id字段会自动设为Settings.KEY
     * 
     * @returns {Promise<void>} 返回无内容的Promise
     *                         - 成功：Promise解析为undefined
     *                         - 失败：Promise拒绝并提供错误信息
     * 
     * 可能的错误：
     * - 数据库未初始化
     * - 数据库写入权限问题
     * - 存储空间不足
     * 
     * 使用示例：
     * @example
     * // 创建新配置并保存
     * try {
     *   const settings = new Settings(5);
     *   await Settings.save(settings);
     *   console.log('设置已保存');
     * } catch (error) {
     *   console.error('保存设置失败:', error);
     * }
     */
    static async save(settings: Settings): Promise<void> {
        const transaction = Database.getDatabase().transaction([Settings.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(Settings.STORE_NAME);
        await objectStore.put(settings);
    }

    /**
     * 更新现有配置
     * 
     * 将修改后的设置对象更新到数据库中
     * 功能上与save方法相同，但语义上用于更新已存在的设置
     * 
     * 功能特性：
     * - 使用"readwrite"事务模式确保写入安全
     * - 如果设置不存在，会创建新记录
     * - 保留了语义区分，便于代码理解和维护
     * 
     * 注意事项：
     * - 调用前需确保Database已初始化
     * - 通常在findSettings()后修改设置再调用此方法
     *
     * @param {Settings} settings - 要更新的配置对象实例
     *                            - 必须是Settings类的实例
     *                            - 通常是通过findSettings()获取并修改后的对象
     * 
     * @returns {Promise<void>} 返回无内容的Promise
     *                         - 成功：Promise解析为undefined
     *                         - 失败：Promise拒绝并提供错误信息
     * 
     * 可能的错误：
     * - 数据库未初始化
     * - 数据库写入权限问题
     * - 事务冲突
     * 
     * 使用示例：
     * @example
     * // 更新并发数设置
     * try {
     *   // 获取当前设置
     *   const settings = await Settings.findSettings();
     *   
     *   // 修改并发数
     *   settings.concurrency = 8;
     *   
     *   // 保存更新
     *   await Settings.update(settings);
     *   console.log('设置已更新');
     * } catch (error) {
     *   console.error('更新设置失败:', error);
     * }
     */
    static async update(settings: Settings): Promise<void> {
        const transaction = Database.getDatabase().transaction([Settings.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(Settings.STORE_NAME);
        await objectStore.put(settings);
    }

    /**
     * 从数据库读取配置信息
     * 
     * 从IndexedDB中检索当前存储的设置数据
     * 如果找到设置记录，返回包含这些设置的Settings对象
     * 
     * 功能特性：
     * - 使用"readonly"事务模式提高性能
     * - 返回新的Settings实例，而非原始存储的对象
     * - 如果设置不存在，抛出异常
     * 
     * 注意事项：
     * - 调用前需确保Database已初始化
     * - 首次使用前应先调用save方法创建初始设置
     *
     * @returns {Promise<Settings>} 返回Settings对象的Promise
     *                             - 成功：Promise解析为包含当前设置的Settings实例
     *                             - 失败：Promise拒绝并提供错误信息
     * 
     * 可能的错误：
     * - "Settings not found"：未找到设置记录
     * - 数据库未初始化
     * - 数据库读取权限问题
     * 
     * 使用示例：
     * @example
     * // 获取当前设置
     * try {
     *   const settings = await Settings.findSettings();
     *   console.log(`当前并发数: ${settings.concurrency}`);
     * } catch (error) {
     *   if (error.message === 'Settings not found') {
     *     // 首次使用，创建默认设置
     *     const defaultSettings = new Settings();
     *     await Settings.save(defaultSettings);
     *     console.log('已创建默认设置');
     *   } else {
     *     console.error('读取设置失败:', error);
     *   }
     * }
     * 
     * // 带默认值的获取模式
     * async function getSettingsOrDefault() {
     *   try {
     *     return await Settings.findSettings();
     *   } catch (error) {
     *     const defaultSettings = new Settings();
     *     await Settings.save(defaultSettings);
     *     return defaultSettings;
     *   }
     * }
     */
    static async findSettings(): Promise<Settings> {
        const transaction = Database.getDatabase()
            .transaction([Settings.STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(Settings.STORE_NAME);
        const result = await objectStore.get(Settings.KEY); // 直接使用 await

        if (result) {
            return new Settings(result.concurrency);
        } else {
            throw new Error("Settings not found");
        }
    }

}