/**
 * URL解析工具类，用于识别当前页面类型和解析GAV坐标
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

export interface GAVInfo {
    groupId: string;
    artifactId: string;
    version: string;
}

export class PageDetector {
    /** 组件版本列表页的正则模式 */
    private static readonly VERSION_LIST_REGEX = /^https:\/\/mvnrepository\.com\/artifact\/[^/]+\/[^/]+$/;
    /** 组件详情页的正则模式 */
    private static readonly DETAIL_PAGE_REGEX = /^https:\/\/mvnrepository\.com\/artifact\/[^/]+\/[^/]+\/[^/]+$/;
    /** GAV解析前缀 */
    private static readonly GAV_PREFIX = 'https://mvnrepository.com/artifact/';

    /**
     * 判断当前是否在组件版本列表页
     *
     * @returns {boolean} 匹配结果
     *
     * @example
     * // 当URL为 https://mvnrepository.com/artifact/com.google.guava/guava 时返回true
     */
    static isInComponentVersionListPage(): boolean {
        return this.VERSION_LIST_REGEX.test(window.location.href);
    }

    /**
     * 判断当前是否在组件详情页
     *
     * @returns {boolean} 匹配结果
     *
     * @example
     * // 当URL为 https://mvnrepository.com/artifact/com.google.guava/guava/31.1-jre 时返回true
     */
    static isInComponentDetailPage(): boolean {
        return this.DETAIL_PAGE_REGEX.test(window.location.href);
    }

    /**
     * 从URL解析Maven坐标信息（GroupId, ArtifactId, Version）
     *
     * @param {string} url - 需要解析的URL地址
     * @returns {GAVInfo} 包含GAV信息的对象
     *
     * @example
     * // 返回 { groupId: 'com.google.guava', artifactId: 'guava', version: '31.1-jre' }
     * parseGAV('https://mvnrepository.com/artifact/com.google.guava/guava/31.1-jre');
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