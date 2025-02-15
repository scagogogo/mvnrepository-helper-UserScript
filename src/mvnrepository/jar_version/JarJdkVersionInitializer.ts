import ComponentDetailPageEnhancer from "./page/ComponentDetailPageEnhancer";
import ComponentVersionListEnhancer from "./page/ComponentVersionListEnhancer";

/**
 * 初始化展示Jar版本
 */
export default class JarJdkVersionInitializer {
    static async initJarJdkVersion() {
        // 初始化组件详情页的JDK版本展示
        await ComponentDetailPageEnhancer.initComponentDetailPageJarJdkVersion();

        // 初始化组件列表页的JDK版本展示
        ComponentVersionListEnhancer.initComponentVersionListPageJarJdkVersion();
    }
}