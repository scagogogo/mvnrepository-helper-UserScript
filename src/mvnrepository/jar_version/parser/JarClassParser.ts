import ClassFileUtil from "../../../utils/ClassFileUtil";

/**
 * JAR 文件 Class 版本分析工具
 */
export default class JarClassParser {
    /**
     * 黑名单中的文件名
     * 
     * @description
     * 用于存储需要忽略的特殊class文件名，避免这些文件影响版本分析的准确性。
     * 
     * @type {Set<string>}
     */
    private static blackFilenames: Set<string>;

    /**
     * 初始化 JAR 黑名单文件名
     * 
     * @description
     * 功能描述：
     * 初始化需要忽略的特殊class文件列表，这些文件可能会干扰版本分析的准确性。
     * 例如，某些Java 8构建的包中可能包含Java 9模块信息文件，但不影响整体兼容性。
     * 
     * 适用场景：
     * - 避免特定文件导致的JDK版本误判
     * - 为parseClassBuildJdkVersionMetric方法准备过滤条件
     * 
     * 边界条件：
     * - 需要在类加载时自动执行
     * - 黑名单内容基于经验维护，可能需要随时间更新
     * 
     * @returns {Set<string>} 初始化完成的黑名单文件名集合
     * 
     * @example
     * // 内部调用示例，通常在类初始化时自动执行
     * const blacklist = JarClassParser.initJarBlackFileName();
     * if (blacklist.has("module-info.class")) {
     *   console.log("模块信息文件已加入黑名单");
     * }
     */
    public static initJarBlackFileName(): Set<string> {
        JarClassParser.blackFilenames = new Set<string>();

        // 有一些 Jar 包明明是 1.8 版本的，但会内置一个模块信息，而这模块信息是可以被忽略的，比如：
        // <url id="cuo81oj1huip18l7gd8g" type="url" status="parsed" title="Just a moment..." wc="161">https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind/2.18.2</url>
        JarClassParser.blackFilenames.add("META-INF/versions/9/module-info.class");
        JarClassParser.blackFilenames.add("module-info.class");

        return JarClassParser.blackFilenames;
    }

    /**
     * 统计 JAR 中所有 Class 文件的版本信息
     * 
     * @description
     * 功能描述：
     * 分析JAR包中所有Class文件的版本号，统计各版本的数量分布并找出最高版本。
     * 跳过黑名单中的特殊文件，以确保版本检测的准确性。
     * 
     * 适用场景：
     * - 分析JAR包的JDK兼容性
     * - 检测是否存在高版本JDK编译的文件，可能导致运行时不兼容
     * - 了解JAR包中不同版本Class文件的分布情况
     * 
     * 边界条件：
     * - 大型JAR包含有大量Class文件时，分析性能可能受影响
     * - 依赖正确的JAR文件结构
     * - 需要预先初始化黑名单文件集合
     * 
     * @param {Object} jarFile - JAR文件对象，通常是JSZip解析后的结果
     * @param {Object} jarFile.files - JAR中的文件映射，键为文件路径，值为文件内容
     * 
     * @returns {Object} 返回分析结果对象，包含以下属性：
     *   - metric: Map<number, number> - 各版本号的Class文件数量统计
     *   - maxMajorVersion: number - 检测到的最高主版本号
     *   - maxMinorVersion: number - 对应于最高主版本的次版本号
     * 
     * @example
     * // 使用JSZip解析JAR文件后分析Class版本
     * const jarContent = await fetch('example.jar').then(r => r.arrayBuffer());
     * const zip = await JSZip.loadAsync(jarContent);
     * const result = JarClassParser.parseClassBuildJdkVersionMetric(zip);
     * 
     * console.log('最高主版本号:', result.maxMajorVersion);
     * // 输出各版本分布
     * result.metric.forEach((count, version) => {
     *   console.log(`Java版本 ${ClassFileUtil.jdkVersionToHumanReadableString(version, 0)}: ${count}个文件`);
     * });
     * 
     * // 版本映射示例 (major version -> JDK版本)
     * // 45 -> Java 1.1
     * // 46 -> Java 1.2
     * // 47 -> Java 1.3
     * // 48 -> Java 1.4
     * // 49 -> Java 5
     * // 50 -> Java 6
     * // 51 -> Java 7
     * // 52 -> Java 8
     * // 53 -> Java 9
     * // 54 -> Java 10
     * // 55 -> Java 11
     * // 等等...
     */
    public static parseClassBuildJdkVersionMetric(jarFile: { files: { [filename: string]: any } }): {
        metric: Map<number, number>, // 统计结果
        maxMajorVersion: number,    // 最大主版本号
        maxMinorVersion: number     // 最大次版本号
    } {
        const metric = new Map<number, number>();
        let maxMajorVersion = 0;
        let maxMinorVersion = 0;

        for (const filename of Object.keys(jarFile.files)) {
            // 黑名单中的文件不参与统计
            if (JarClassParser.blackFilenames.has(filename)) {
                continue;
            }

            const jarEntry = jarFile.files[filename];
            if (!ClassFileUtil.isClassFileName(filename)) {
                continue;
            }

            const classBytes = jarEntry.asUint8Array();
            // if (!ClassFileUtil.isClassFileBytes(classBytes)) {
            //   continue;
            // }

            const {majorVersion, minorVersion} = ClassFileUtil.parseClassFileVersion(classBytes);

            if (majorVersion > maxMajorVersion) {
                maxMajorVersion = majorVersion;
                maxMinorVersion = minorVersion;
            }

            const count = metric.get(majorVersion) || 0;
            metric.set(majorVersion, count + 1);

            // console.log(`Filename: ${filename}, Major Version: ${majorVersion}`);
        }

        return {
            metric,
            maxMajorVersion,
            maxMinorVersion
        };
    }
}

// 初始化黑名单文件名
JarClassParser.initJarBlackFileName();

/**
 * 使用示例：
 * const jarAnalyzer = new JarClassAnalyzer();
 * const result = jarAnalyzer.parseClassBuildJdkVersionMetric(yourJarFile);
 * console.log('Max Major Version:', result.maxMajorVersion);
 * console.log('Version Distribution:', result.metric);
 */