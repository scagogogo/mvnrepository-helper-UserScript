/**
 * 从manifest中解析编译jar包时的jdk版本
 *
 * 示例用法：
 * ```typescript
 * const manifest = `Created-By: 1.8.0_181 (Oracle Corporation)
 * Build-Jdk: 1.8.0_211`;
 * const result = ManifestParser.parseBuildJdkVersion(manifest);
 * console.log(result); // 输出: { key: 'Build-Jdk', value: '1.8.0_211' }
 * ```
 */

export default class ManifestParser {
    /**
     * 从manifest中解析编译jar包时的jdk版本
     *
     * @description
     * 功能描述：
     * 解析JAR包MANIFEST.MF文件中的JDK版本信息，通过检查几个关键标识符来确定构建环境。
     * 按优先级顺序查找各种可能包含JDK版本信息的键，返回找到的第一个有效值。
     * 
     * 适用场景：
     * - 分析JAR文件的构建环境
     * - 确定JAR包的兼容性要求
     * - 判断JAR包的编译版本
     * 
     * 边界条件：
     * - 输入可能为null或空字符串，此时返回空键值对
     * - MANIFEST.MF可能不包含构建环境信息
     * - 不同构建工具生成的标识符可能不同
     * 
     * @param {string} manifest - MANIFEST.MF文件内容文本，可能为null或空字符串
     * 
     * @returns {{key: string, value: string}} 返回包含键和值的对象：
     *   - key: 找到的JDK版本标识符键(如'Build-Jdk')
     *   - value: 对应的JDK版本值(如'1.8.0_211')
     *   - 如果未找到相关信息，则返回{key:"", value:""}
     * 
     * @example
     * // 示例1: 标准Maven构建的MANIFEST
     * const manifest1 = `Manifest-Version: 1.0
     * Created-By: Apache Maven 3.6.3
     * Built-By: jenkins
     * Build-Jdk: 11.0.7`;
     * const result1 = ManifestParser.parseBuildJdkVersion(manifest1);
     * console.log(result1); // 输出: { key: 'Build-Jdk', value: '11.0.7' }
     * 
     * // 示例2: Gradle构建的MANIFEST
     * const manifest2 = `Manifest-Version: 1.0
     * Implementation-Title: My Project
     * Implementation-Version: 1.0.0
     * Created-By: 1.8.0_252 (Oracle Corporation)`;
     * const result2 = ManifestParser.parseBuildJdkVersion(manifest2);
     * console.log(result2); // 输出: { key: 'Created-By', value: '1.8.0_252 (Oracle Corporation)' }
     * 
     * // 示例3: 无版本信息的MANIFEST
     * const manifest3 = `Manifest-Version: 1.0
     * Implementation-Title: Test
     * Implementation-Vendor: Example Corp`;
     * const result3 = ManifestParser.parseBuildJdkVersion(manifest3);
     * console.log(result3); // 输出: { key: "", value: "" }
     * 
     * // 示例4: 处理空输入
     * const result4 = ManifestParser.parseBuildJdkVersion("");
     * console.log(result4); // 输出: { key: "", value: "" }
     */
    public static parseBuildJdkVersion(manifest: string): { key: string, value: string } {
        // 将Manifest内容按行分割并存入数组
        const lines = (manifest || "").split('\n');
        const map = new Map<string, string>();

        // 遍历每一行，解析键值对并存入Map
        for (const line of lines) {
            const split = line.split(":");
            if (split.length === 2) {
                const key = split[0].trim();
                const value = split[1].trim();
                map.set(key, value);
            }
        }

        // 定义可能包含JDK版本信息的键
        // 在JAR包的MANIFEST.MF文件中，可以查找以下key来确定编译JAR包时使用的JDK版本：
        // Created-By：这个属性包含了编译JAR包的JDK版本信息。例如，Created-By: 1.8.0_181 (Oracle Corporation)表示JAR包是用JDK 1.8.0_181版本编译的
        // Build-Jdk-Spec：这个属性表示编译JAR包时所使用的JDK规范版本。例如，Build-Jdk-Spec: 1.8表示JAR包是按照JDK 1.8规范编译的
        // Build-Jdk：这个属性可能包含JDK的具体版本信息，例如Build-Jdk: 1.8.0_211表示JAR包使用的是JDK 1.8.0_211版本
        const keys = ['Build-Jdk', 'Built-JDK', 'Build-Jdk-Spec', 'Created-By'];

        // 遍历键数组，查找第一个匹配的键并返回其值
        for (const key of keys) {
            const value = map.get(key);
            if (value) {
                return {
                    key,
                    value
                };
            }
        }
        return {
            key: "",
            value: "",
        };
    }
}