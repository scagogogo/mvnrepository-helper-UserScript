import ComponentDetailPageEnhancer from "./page/ComponentDetailPageEnhancer";
import ComponentVersionListEnhancer from "./page/ComponentVersionListEnhancer";

/**
 * 初始化展示Jar版本
 */
export default class JarJdkVersionInitializer {
    /**
     * 初始化JAR包JDK版本检测功能
     * 
     * @description
     * 功能描述：
     * 通过调用各页面增强器的初始化方法，为Maven仓库页面添加JAR包JDK版本检测功能。
     * 根据当前页面类型自动加载相应的增强功能，包括组件详情页和版本列表页。
     * 
     * 适用场景：
     * - 用户脚本初始化时调用
     * - 页面类型发生变化时调用
     * - 需要重新加载增强功能时调用
     * 
     * 边界条件：
     * - 需要在DOM完全加载后调用
     * - 依赖PageDetector正确识别页面类型
     * - 异步方法，等待所有初始化完成
     * 
     * @returns {Promise<void>} 无返回值的Promise，所有初始化完成后resolve
     * 
     * @throws {Error} 如果页面增强器初始化过程中出现错误，可能会抛出异常
     * 
     * @example
     * // 在用户脚本的main函数中调用
     * async function main() {
     *   await JarJdkVersionInitializer.initJarJdkVersion();
     *   console.log('JAR版本检测功能初始化完成');
     * }
     * 
     * // 在页面变化时重新初始化
     * document.addEventListener('urlchange', async () => {
     *   await JarJdkVersionInitializer.initJarJdkVersion();
     * });
     */
    static async initJarJdkVersion() {
        // 初始化组件详情页的JDK版本展示
        await ComponentDetailPageEnhancer.initComponentDetailPageJarJdkVersion();

        // 初始化组件列表页的JDK版本展示
        ComponentVersionListEnhancer.initComponentVersionListPageJarJdkVersion();
    }
}