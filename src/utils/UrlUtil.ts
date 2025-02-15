/**
 * URL 工具类，提供URL解析相关方法
 *
 * 使用示例：
 * @example
 * UrlUtil.parseBaseUrl('https://www.example.com/path?query=1');
 * // 返回 'https://www.example.com'
 */
export default class UrlUtil {

    /**
     * 从完整URL中解析基础URL（协议+主机）
     *
     * @param {string} url - 需要解析的完整URL地址
     * @returns {string} 基础URL字符串，格式为 protocol://host
     *
     * @example
     * // 返回 'https://api.github.com'
     * UrlUtil.parseBaseUrl('https://api.github.com/users/octocat/repos');
     */
    static parseBaseUrl(url: string): string {
        // 使用浏览器原生URL API进行解析
        const parsedUrl = new URL(url);

        // 组合协议和主机部分（自动包含端口号，如:3000等）
        return `${parsedUrl.protocol}//${parsedUrl.host}`;
    }

}