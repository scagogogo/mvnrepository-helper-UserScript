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
     * @param manifest Manifest内容
     * @returns {{value: string, key: string}|{}} 包含key和value的对象，如果未找到则返回空对象
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