import ClassFileUtil from "../../../utils/ClassFileUtil";

/**
 * JAR 文件 Class 版本分析工具
 */
export default class JarClassParser {
    /**
     * 黑名单中的文件名
     */
    private static blackFilenames: Set<string>;

    /**
     * 初始化 JAR 黑名单文件名
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
     * @param jarFile JAR 文件对象
     * @returns 统计结果
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