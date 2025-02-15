import ComponentDetailPageEnhancer from "./page/ComponentDetailPageEnhancer";
import ComponentVersionListEnhancer from "./page/ComponentVersionListEnhancer";

/**
 * 初始化展示Jar版本
 */
export default class JarJdkVersionInitializer {
    static initJarJdkVersion(): void {
        // 初始化组件详情页的JDK版本展示
        ComponentDetailPageEnhancer.initComponentDetailPageJarJdkVersion();

        // 初始化组件列表页的JDK版本展示
        ComponentVersionListEnhancer.initComponentVersionListPageJarJdkVersion();
    }
}