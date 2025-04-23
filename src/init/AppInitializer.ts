import 'current-script-polyfill';
import Settings from "../database/Settings";
import ExpandTextUtil from "../repo1/expand-text/ExpandTextUtil";
import QuickJumpManager from "../repo1/quick-jump/QuickJumpManager";
import {RepoInformationStorage} from "../database/RepoInformationStorage";
import FloatBallComponent from "../mvnrepository/jar_version/ui/FloatBallComponent";
import JarJdkVersionInitializer from "../mvnrepository/jar_version/JarJdkVersionInitializer";
import Database from "../database/Database";
import {logger, LogLevel} from "../logger/Logger";

/**
 * 应用程序初始化类
 * 
 * 负责整个UserScript应用的初始化流程，根据不同的网站域名启用不同的功能模块。
 * 这是应用的入口点，通过index.ts调用此类的init方法开始整个应用的生命周期。
 * 
 * 支持的网站：
 * - repo1.maven.org: Maven中央仓库，启用文本展开和快速跳转功能
 * - mvnrepository.com: Maven仓库索引网站，启用数据库、仓库信息存储、设置面板和JAR包JDK版本检查
 * 
 * 初始化流程：
 * 1. 设置日志级别
 * 2. 根据当前网站域名判断并初始化相应功能
 * 3. 对于不同网站，调用相应的功能初始化方法
 * 
 * 使用示例：
 * @example
 * // 在应用入口点调用
 * await AppInitializer.init();
 * 
 * // 整个应用的启动流程
 * (async () => {
 *   try {
 *     await AppInitializer.init();
 *     logger.info('应用初始化完成');
 *   } catch (error) {
 *     logger.error('应用初始化失败:', error);
 *   }
 * })();
 */
export default class AppInitializer {
    /**
     * 应用程序初始化方法
     * 
     * 该方法是应用的主要入口点，负责根据当前网站环境初始化不同的功能模块。
     * 初始化过程是异步的，会等待数据库和其他异步组件完成初始化。
     * 
     * 功能特性：
     * - 自动识别当前网站域名并启用相应功能
     * - 设置全局日志级别
     * - 按需初始化数据库和存储
     * - 创建用户界面组件
     * 
     * 初始化流程详解：
     * 1. 设置日志级别为DEBUG（便于开发调试）
     * 2. 检查当前网站域名
     * 3. 在repo1.maven.org上：
     *    - 启用文本展开功能（便于查看长文本）
     *    - 添加快速跳转功能（便于在页面间导航）
     * 4. 在mvnrepository.com上：
     *    - 初始化IndexedDB数据库
     *    - 初始化仓库信息存储
     *    - 创建设置悬浮球（用于调整并发设置）
     *    - 初始化JAR包JDK版本检查功能
     * 
     * 性能影响：
     * - 初始化过程会进行数据库操作和DOM操作，可能会短暂影响页面响应性
     * - 全部功能初始化完成后不会有持续的性能开销
     * 
     * 可能的错误：
     * - 数据库初始化失败（如浏览器不支持IndexedDB）
     * - DOM操作失败（如页面结构变化）
     * - 网络请求失败（如请求JAR包信息时）
     * 
     * @returns {Promise<void>} 当所有初始化步骤完成后resolve的Promise
     *                          不包含返回值，但会在内部创建和配置必要的组件
     * 
     * 使用示例：
     * @example
     * // 基本用法
     * try {
     *   await AppInitializer.init();
     *   console.log('应用已成功初始化');
     * } catch (error) {
     *   console.error('应用初始化失败:', error);
     * }
     * 
     * // 在油猴脚本中的使用
     * (function() {
     *   'use strict';
     *   window.addEventListener('load', async function() {
     *     await AppInitializer.init();
     *   });
     * })();
     * 
     * @see Database.initDatabase 数据库初始化方法
     * @see RepoInformationStorage.init 仓库信息存储初始化方法
     * @see JarJdkVersionInitializer.initJarJdkVersion JAR包JDK版本检查初始化方法
     */
    static async init(): Promise<void> {

        // TODO 开发的时候把日志设置为debug级别
        logger.setLevel(LogLevel.DEBUG);

        // 根据不同的域名启用不同的逻辑
        switch (window.location.hostname) {
            case 'repo1.maven.org':
                // 在下载页面，一般是为了开发SCA类应用才会重点关注这个域名
                ExpandTextUtil.expandText();
                QuickJumpManager.addQuickJump();
                break;
            case 'mvnrepository.com':
                // 仅仅在mvnrepository这个域名下需要创建数据库，避免在乱七八糟的域名下创建此数据库
                await Database.initDatabase();
                await RepoInformationStorage.init();

                // 展示设置的悬浮球
                const settings = await Settings.findSettings() ?? new Settings();
                const floatBall = new FloatBallComponent({
                    defaultConcurrency: settings.concurrency || 3,
                    onSave: (value: number) => {
                        const newSettings = new Settings();
                        newSettings.concurrency = value;
                        Settings.save(newSettings);
                    }
                });

                // Java开发者都会用到的这个域名
                await JarJdkVersionInitializer.initJarJdkVersion();
                break;
        }
    }
}