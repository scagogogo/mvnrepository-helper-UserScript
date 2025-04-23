/**
 * URL解析工具类，用于识别当前页面类型和解析GAV坐标
 *
 * 功能说明：
 * 1. 识别当前页面是否为组件版本列表页或组件详情页
 * 2. 从URL中解析Maven GAV坐标信息（GroupId、ArtifactId、Version）
 * 3. 为其他组件提供页面类型检测服务
 *
 * 适用场景：
 * - 用户脚本初始化时检测页面类型
 * - URL变化时判断当前页面
 * - 需要获取当前页面Maven构件信息时
 * - 在增强功能启动前检查页面兼容性
 *
 * 边界条件：
 * - 仅支持特定格式的Maven仓库URL
 * - 依赖window.location提供的URL信息
 * - URL不符合预期格式时会返回null或false
 *
 * 使用示例：
 * @example
 * // 检测页面类型
 * if (PageDetector.isInComponentVersionListPage()) {
 *   console.log('当前在组件版本列表页');
 * }
 *
 * // 解析GAV信息
 * const gav = PageDetector.parseGAV(window.location.href);
 * console.log(`GroupID: ${gav.groupId}, ArtifactID: ${gav.artifactId}`);
 */

/**
 * Maven GAV坐标信息接口
 * 
 * @description
 * 定义Maven构件的坐标信息结构，包含构件的三个基本标识属性
 * 
 * @interface GAVInfo
 * @property {string} groupId - 组织或项目的标识符，如'org.springframework'
 * @property {string} artifactId - 构件的标识符，如'spring-core'
 * @property {string} version - 构件的版本号，如'5.3.9'
 */
export interface GAVInfo {
    groupId: string;
    artifactId: string;
    version: string;
}

/**
 * 页面检测工具类
 * 
 * @description
 * 用于检测当前页面类型和解析Maven坐标信息的工具类，
 * 提供静态方法判断页面类型和解析URL信息，
 * 作为用户脚本的基础服务组件。
 * 
 * @class PageDetector
 */
export class PageDetector {
    /**
     * 组件版本列表页的正则模式
     * 
     * @description
     * 用于匹配组件版本列表页URL的正则表达式
     * 格式为: https://mvnrepository.com/artifact/{groupId}/{artifactId}
     * 
     * @type {RegExp}
     * @private
     * @readonly
     */
    private static readonly VERSION_LIST_REGEX = /^https:\/\/mvnrepository\.com\/artifact\/[^/]+\/[^/]+$/;
    
    /**
     * 组件详情页的正则模式
     * 
     * @description
     * 用于匹配组件详情页URL的正则表达式
     * 格式为: https://mvnrepository.com/artifact/{groupId}/{artifactId}/{version}
     * 
     * @type {RegExp}
     * @private
     * @readonly
     */
    private static readonly DETAIL_PAGE_REGEX = /^https:\/\/mvnrepository\.com\/artifact\/[^/]+\/[^/]+\/[^/]+$/;
    
    /**
     * GAV解析前缀
     * 
     * @description
     * Maven仓库URL前缀，用于验证和截取URL
     * 
     * @type {string}
     * @private
     * @readonly
     */
    private static readonly GAV_PREFIX = 'https://mvnrepository.com/artifact/';

    /**
     * 判断当前是否在组件版本列表页
     * 
     * @description
     * 功能描述：
     * 通过正则表达式判断当前页面URL是否为组件版本列表页格式。
     * 版本列表页显示某个特定构件的所有可用版本。
     * 
     * 适用场景：
     * - 用户脚本初始化时判断是否需要启用版本列表增强功能
     * - URL变化时决定是否需要重新渲染增强内容
     * - 作为条件检查避免在非相关页面执行代码
     * 
     * 边界条件：
     * - 依赖window.location提供的URL
     * - 仅匹配特定格式的URL路径
     * 
     * @returns {boolean} 当前页面是否为组件版本列表页
     * 
     * @example
     * // 当URL为 https://mvnrepository.com/artifact/com.google.guava/guava 时返回true
     * if (PageDetector.isInComponentVersionListPage()) {
     *   initVersionListEnhancement();
     * }
     */
    static isInComponentVersionListPage(): boolean {
        return this.VERSION_LIST_REGEX.test(window.location.href);
    }

    /**
     * 判断当前是否在组件详情页
     * 
     * @description
     * 功能描述：
     * 通过正则表达式判断当前页面URL是否为组件详情页格式。
     * 详情页显示特定版本构件的详细信息。
     * 
     * 适用场景：
     * - 用户脚本初始化时判断是否需要启用详情页增强功能
     * - URL变化时决定是否需要重新渲染增强内容
     * - 作为条件检查避免在非相关页面执行代码
     * 
     * 边界条件：
     * - 依赖window.location提供的URL
     * - 仅匹配特定格式的URL路径
     * 
     * @returns {boolean} 当前页面是否为组件详情页
     * 
     * @example
     * // 当URL为 https://mvnrepository.com/artifact/com.google.guava/guava/31.1-jre 时返回true
     * if (PageDetector.isInComponentDetailPage()) {
     *   initDetailPageEnhancement();
     * }
     */
    static isInComponentDetailPage(): boolean {
        return this.DETAIL_PAGE_REGEX.test(window.location.href);
    }

    /**
     * 从URL解析Maven坐标信息
     * 
     * @description
     * 功能描述：
     * 从Maven仓库URL中提取GroupId、ArtifactId和Version信息。
     * 解析URL路径部分，按"/"分割获取各部分坐标。
     * 
     * 适用场景：
     * - 需要获取当前查看构件的Maven坐标
     * - 构建下载URL或API请求时需要GAV信息
     * - 记录用户浏览历史时提取构件标识
     * 
     * 边界条件：
     * - URL必须以特定前缀开头，否则返回null
     * - URL格式应符合Maven仓库的标准路径结构
     * - 版本号部分在详情页存在，在版本列表页可能不存在
     * 
     * @param {string} url - 需要解析的URL地址
     * 
     * @returns {GAVInfo | null} 包含GAV信息的对象，解析失败时返回null
     * 
     * @example
     * // 返回 { groupId: 'com.google.guava', artifactId: 'guava', version: '31.1-jre' }
     * const gav = PageDetector.parseGAV('https://mvnrepository.com/artifact/com.google.guava/guava/31.1-jre');
     * 
     * // 版本列表页返回 { groupId: 'com.google.guava', artifactId: 'guava', version: undefined }
     * const listGav = PageDetector.parseGAV('https://mvnrepository.com/artifact/com.google.guava/guava');
     * 
     * // 非Maven仓库URL返回null
     * const invalid = PageDetector.parseGAV('https://example.com/some/other/path');
     */
    static parseGAV(url: string): GAVInfo | null {
        if (!url.startsWith(this.GAV_PREFIX)) {
            return null;
        }

        const pathSegment = url.slice(this.GAV_PREFIX.length);
        const [groupId, artifactId, version] = pathSegment.split('/');

        return {
            groupId: groupId,
            artifactId: artifactId,
            version: version
        };
    }

}