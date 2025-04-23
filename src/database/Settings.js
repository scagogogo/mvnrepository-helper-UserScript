/**
 * 设置管理模块 - JavaScript实现版本
 * 
 * 本模块提供用户设置的存储和管理功能，是TypeScript版本(Settings.ts)的JavaScript实现
 * 使用IndexedDB作为持久化存储方案，支持异步操作
 * 
 * 主要功能：
 * - 设置对象的创建
 * - 保存设置到数据库
 * - 更新已有设置
 * - 读取设置信息
 * 
 * 注意事项：
 * - 建议优先使用TypeScript版本(Settings.ts)
 * - 本文件保留用于兼容性考虑或特殊场景使用
 */
const {Database} = require("./Database");

/**
 * 设置存储的对象存储空间名称常量
 * 
 * 用于在IndexedDB中标识存储设置数据的对象存储空间
 * 值为"settings"，需与数据库创建时指定的存储空间名称一致
 */
const NAME = "settings";

/**
 * 设置记录的唯一标识符常量
 * 
 * 用于在对象存储空间中标识设置记录的ID
 * 值为"settings"，表示单一设置记录
 */
const ID = "settings";

/**
 * 用户设置类
 * 
 * 表示用户可配置的设置项，如并发请求数等
 * 设计为单例模式，整个应用共享同一个设置记录
 * 
 * 存储结构：
 * - id: 固定为"settings"，作为数据库主键
 * - concurrency: 并发请求数，默认值为3
 */
class Settings {
    /**
     * 创建设置对象实例
     * 
     * 初始化一个包含默认设置值的对象
     * 不接受外部参数，使用内部预设的默认值
     * 
     * 默认值：
     * - id: "settings" (固定值)
     * - concurrency: 3 (并发请求数)
     * 
     * 使用示例：
     * @example
     * // 创建默认设置对象
     * const defaultSettings = new Settings();
     * console.log(defaultSettings.concurrency); // 输出: 3
     */
    constructor() {
        /**
         * 设置记录的唯一标识符
         * 
         * 固定值为"settings"
         * 作为数据库主键使用
         */
        this.id = ID;
        
        /**
         * 并发请求数
         * 
         * 控制同时发起的网络请求最大数量
         * 默认值为3
         * 取值范围：正整数（推荐1-10）
         * 
         * 影响：
         * - 值越大，请求处理速度越快，但可能增加浏览器和服务器负担
         * - 值越小，对服务器压力越小，但处理速度会变慢
         */
        this.concurrency = 3;
    }
}

/**
 * 保存设置到数据库
 * 
 * 将设置对象持久化存储到IndexedDB中
 * 如果数据库中已存在设置记录，则覆盖它
 * 
 * 操作流程：
 * 1. 创建readwrite事务和对象存储访问
 * 2. 执行put操作保存数据
 * 3. 设置成功和失败回调函数
 * 
 * @param {Settings} settings - 要保存的设置对象
 *                            - 必须是Settings类的实例
 *                            - id属性必须设置为"settings"
 * 
 * @returns {Promise<void>} 返回一个Promise
 *                         - 成功时：Promise解析完成但无返回值
 *                         - 失败时：Promise被拒绝，原因为错误对象
 * 
 * 可能的错误：
 * - 数据库未初始化
 * - 数据库访问权限不足
 * - 存储空间不存在
 * 
 * 使用示例：
 * @example
 * // 保存自定义设置
 * const settings = new Settings();
 * settings.concurrency = 5; // 设置并发数为5
 * 
 * try {
 *   await saveSettings(settings);
 *   console.log('设置已保存');
 * } catch (error) {
 *   console.error('保存设置失败:', error);
 * }
 * 
 * @see updateSettings 更新设置的方法（功能相同但语义不同）
 * @see findSettings 查询设置的方法
 */
async function saveSettings(settings) {
    const request = await Database.getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(settings);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };
}

/**
 * 更新现有设置
 * 
 * 将修改后的设置对象更新到数据库中
 * 功能上与saveSettings相同，但语义上用于更新已存在的设置
 * 
 * 操作流程：
 * 1. 创建readwrite事务和对象存储访问
 * 2. 执行put操作更新数据
 * 3. 设置成功和失败回调函数
 * 
 * @param {Settings} settings - 要更新的设置对象
 *                            - 必须是Settings类的实例
 *                            - 通常是通过findSettings()获取后修改的对象
 * 
 * @returns {Promise<void>} 返回一个Promise
 *                         - 成功时：Promise解析完成但无返回值
 *                         - 失败时：Promise被拒绝，原因为错误对象
 * 
 * 可能的错误：
 * - 数据库未初始化
 * - 数据库访问权限不足
 * - 存储空间不存在
 * 
 * 使用示例：
 * @example
 * // 更新现有设置
 * try {
 *   // 先获取当前设置
 *   const currentSettings = await findSettings();
 *   if (currentSettings) {
 *     // 修改设置值
 *     currentSettings.concurrency = 8;
 *     
 *     // 保存更新
 *     await updateSettings(currentSettings);
 *     console.log('设置已更新');
 *   }
 * } catch (error) {
 *   console.error('更新设置失败:', error);
 * }
 * 
 * @see saveSettings 保存设置的方法（功能相同但语义不同）
 * @see findSettings 查询设置的方法
 */
async function updateSettings(settings) {
    const request = await Database.getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(settings);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };
}

/**
 * 读取设置信息
 * 
 * 从IndexedDB数据库中检索当前保存的设置数据
 * 如果设置不存在，则返回undefined
 * 
 * 操作流程：
 * 1. 创建readonly事务和对象存储访问
 * 2. 使用固定ID(settings)查询设置记录
 * 3. 返回查询结果
 * 
 * 性能特性：
 * - 使用readonly事务，性能开销小
 * - 查询单一记录，速度快
 * 
 * @returns {Promise<Settings|undefined>} 返回一个Promise
 *                                       - 成功找到设置时：Promise解析为Settings对象
 *                                       - 未找到设置时：Promise解析为undefined
 *                                       - 查询出错时：Promise被拒绝，原因为错误对象
 * 
 * 可能的错误：
 * - 数据库未初始化
 * - 数据库访问权限不足
 * - 存储空间不存在
 * 
 * 使用示例：
 * @example
 * // 基本用法
 * try {
 *   const settings = await findSettings();
 *   if (settings) {
 *     console.log(`当前并发设置: ${settings.concurrency}`);
 *   } else {
 *     console.log('未找到设置，使用默认值');
 *     const defaultSettings = new Settings();
 *     await saveSettings(defaultSettings);
 *   }
 * } catch (error) {
 *   console.error('读取设置失败:', error);
 * }
 * 
 * // 带默认值处理的读取方式
 * async function getSettingsWithDefault() {
 *   try {
 *     const settings = await findSettings();
 *     return settings || new Settings();
 *   } catch (error) {
 *     console.error('读取设置失败，使用默认值:', error);
 *     return new Settings();
 *   }
 * }
 * 
 * @see saveSettings 保存设置的方法
 * @see updateSettings 更新设置的方法
 */
async function findSettings() {
    return await Database.getDatabase().transaction([NAME], "readonly").objectStore(NAME).get(ID);
}

/**
 * 模块导出
 * 
 * 导出Settings类和相关的操作函数
 * 使其可以被其他模块导入使用
 */
module.exports = {
    Settings,
    findSettings,
    saveSettings,
    updateSettings
}