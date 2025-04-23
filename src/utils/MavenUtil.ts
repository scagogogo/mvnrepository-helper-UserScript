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
     * 
     * 方法功能描述：
     * -----------
     * 根据Maven GAV坐标（GroupId、ArtifactId、Version）构建对应JAR包在Maven中央仓库的下载URL。
     * 该方法将Maven坐标转换为符合Maven仓库规范的路径，并拼接到中央仓库基础URL之后。
     * 
     * 默认行为：
     * - 使用Maven中央仓库 (https://repo1.maven.org/maven2/)
     * - 自动转换GroupId的点分格式为路径分隔符格式
     * - 生成标准的JAR文件下载URL
     * 
     * 使用场景：
     * - 生成下载链接用于前端展示
     * - 构建HTTP请求用于动态获取JAR内容
     * - 提供用户直接下载JAR的链接
     * 
     * 限制说明：
     * - 仅支持Maven中央仓库，不支持其他自定义仓库
     * - 不支持快照版本（SNAPSHOT）的特殊路径规则
     * - 不校验坐标的有效性，无效坐标会生成无效URL
     * 
     * 参数详解：
     * - groupId：必填，组织标识符，如'org.springframework'、'com.google.code.gson'
     * - artifactId：必填，项目标识符，如'spring-core'、'gson'
     * - version：必填，版本号，支持标准版本号如'5.3.3'和带限定符的版本如'1.8.0-jre'
     * 
     * 异常处理：
     * - 参数为空时，内部调用buildGavJarPath会抛出异常
     * - 非法字符和格式不会被验证，可能导致无效URL
     * 
     * 使用示例：
     * @example
     * // 获取Spring框架核心包
     * const springCoreUrl = MavenUtil.buildJarUrl('org.springframework', 'spring-core', '5.3.25');
     * console.log(springCoreUrl);
     * // 输出: https://repo1.maven.org/maven2/org/springframework/spring-core/5.3.25/spring-core-5.3.25.jar
     * 
     * @example
     * // 获取带分类器的JAR包
     * const url = MavenUtil.buildJarUrl('org.apache.logging.log4j', 'log4j-api', '2.17.2');
     * fetch(url)
     *   .then(response => response.blob())
     *   .then(blob => {
     *     const link = document.createElement('a');
     *     link.href = URL.createObjectURL(blob);
     *     link.download = 'log4j-api-2.17.2.jar';
     *     link.click();
     *   });
     * 
     * @see buildGavJarPath 内部调用的路径构建方法
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
     * 
     * 方法功能描述：
     * -----------
     * 将Maven坐标信息（GAV）转换为符合Maven仓库标准的JAR文件相对路径。
     * 这个路径可以附加到任何Maven仓库URL后，用于访问或下载特定的JAR文件。
     * 
     * 转换规则：
     * 1. 将groupId中的点号转换为路径分隔符
     * 2. 按照Maven仓库标准格式组织路径结构: groupId/artifactId/version/artifactId-version.jar
     * 
     * 重要特性：
     * - 输入参数有效性验证，为空时抛出异常
     * - 自动处理groupId的格式转换
     * - 可处理各种格式的版本号，包括标准版本和带后缀版本
     * 
     * 性能考量：
     * - 处理速度快，适合批量调用
     * - 无外部依赖，纯字符串操作
     * 
     * 参数详解：
     * - groupId：必填，组织标识符，点分格式，如'org.apache.commons'
     * - artifactId：必填，项目标识符，如'commons-lang3'
     * - version：必填，版本号，常见形式如以下：
     *   * 标准版本号: '3.12.0'
     *   * 带修饰符版本: '2.0.0-RC1'
     *   * 带环境说明版本: '32.1.1-jre'
     *   * 快照版本: '4.0.0-SNAPSHOT'（注意：此方法不适用于处理快照版本的特殊路径）
     * 
     * 异常处理：
     * - 当任何参数为空（null、undefined或空字符串）时，抛出Error
     * - 不进行参数格式有效性校验，调用方应确保参数符合Maven坐标规范
     * 
     * 使用示例：
     * @example
     * // 基本用法
     * const path = MavenUtil.buildGavJarPath('junit', 'junit', '4.13.2');
     * console.log(path); // 输出: 'junit/junit/4.13.2/junit-4.13.2.jar'
     * 
     * @example
     * // 与仓库基础URL结合
     * const baseUrl = 'https://my-maven-repo.com/';
     * const jarPath = MavenUtil.buildGavJarPath('com.fasterxml.jackson.core', 'jackson-databind', '2.14.2');
     * const fullUrl = `${baseUrl}${jarPath}`;
     * // 结果: 'https://my-maven-repo.com/com/fasterxml/jackson/core/jackson-databind/2.14.2/jackson-databind-2.14.2.jar'
     * 
     * @example
     * // 错误处理
     * try {
     *   MavenUtil.buildGavJarPath('', 'commons-io', '2.11.0');
     * } catch (error) {
     *   console.error('生成路径失败:', error.message);
     *   // 输出: '生成路径失败: groupId, artifactId, and version must be non-empty strings.'
     * }
     * 
     * @throws {Error} 当groupId、artifactId或version为空时抛出
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