/**
 * Maven 仓库工具类
 *
 * 提供与Maven仓库相关的工具方法，用于构建Jar包路径和URL
 */
export default class MavenUtil {
    /**
     * 构造Jar包的完整下载URL
     *
     * @example
     * // 返回 'https://repo1.maven.org/maven2/com/google/guava/guava/32.1.3-jre/guava-32.1.3-jre.jar'
     * buildJarUrl('com.google.guava', 'guava', '32.1.3-jre')
     *
     * @param groupId    - Maven groupId，支持点分格式（自动转换为路径）
     *                    （示例：'com.google.guava'）
     * @param artifactId - Maven artifactId
     *                    （示例：'guava'）
     * @param version    - 版本号，支持带后缀的版本
     *                    （示例：'32.1.3-jre'）
     * @returns 完整的Jar包下载URL
     */
    static buildJarUrl(groupId: string, artifactId: string, version: string): string {
        return `https://repo1.maven.org/maven2/${this.buildGavJarPath(groupId, artifactId, version)}`;
    }

    /**
     * 构造GAV坐标对应的Jar文件路径
     *
     * @example
     * // 返回 'com/google/guava/guava/32.1.3-jre/guava-32.1.3-jre.jar'
     * buildGavJarPath('com.google.guava', 'guava', '32.1.3-jre')
     *
     * @param groupId    - Maven groupId，点分格式会被转换为路径
     *                    （示例：'org.apache.logging.log4j'）
     * @param artifactId - Maven artifactId
     *                    （示例：'log4j-core'）
     * @param version    - 版本号，支持带后缀的版本
     *                    （示例：'2.20.0'）
     * @returns 符合Maven仓库规范的Jar文件路径
     */
    static buildGavJarPath(groupId: string, artifactId: string, version: string): string {
        // 验证输入参数
        if (!groupId || !artifactId || !version) {
            throw new Error("groupId, artifactId, and version must be non-empty strings.");
        }

        // 将 groupId 中的点转换为路径分隔符
        const groupPath = groupId.replace(/\./g, "/");

        // 拼接完整的仓库路径
        const jarPath = `${groupPath}/${artifactId}/${version}/${artifactId}-${version}.jar`;

        // 返回规范化后的路径
        return jarPath;
    }

    // TODO 2024-11-24 13:31:47 构造更多的格式（例如pom文件路径、源码包路径等）
    // 潜在扩展方向示例：
    // - buildPomPath(groupId, artifactId, version)
    // - buildSourcesJarPath(groupId, artifactId, version)
    // - buildMavenMetadataUrl(groupId, artifactId)
}