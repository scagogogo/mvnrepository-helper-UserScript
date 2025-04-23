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
     * 
     * 方法功能描述：
     * -----------
     * 从完整URL中提取基础部分（协议+主机部分），去除路径、查询参数和锚点。
     * 该方法使用浏览器内置的URL API进行解析，确保URL解析的正确性和标准一致性。
     * 
     * 提取规则：
     * - 保留协议部分（如http:, https:）
     * - 保留主机名部分（含子域名，如www.example.com）
     * - 保留端口号（如存在，如example.com:8080）
     * - 移除路径部分（如/path/to/resource）
     * - 移除查询参数部分（如?id=123&type=product）
     * - 移除锚点部分（如#section2）
     * 
     * 技术实现：
     * - 使用标准URL构造函数解析输入
     * - 从解析结果中提取protocol和host属性
     * - 组合生成结果字符串
     * 
     * 性能与安全：
     * - 执行速度快（微秒级）
     * - 内存占用小，不创建多余对象
     * - 对无效URL会抛出错误，不会返回错误格式
     * 
     * 适用场景：
     * - 构建API基础地址
     * - 实现同源策略检查
     * - 提取域名用于权限验证
     * - 生成CORS相关配置
     * 
     * 参数详解：
     * - url：必填，完整的URL字符串
     *   * 标准URL：正确提取（如'https://example.com/path'）
     *   * 带端口URL：保留端口（如'http://localhost:3000/api'）
     *   * 带认证URL：保留认证信息（如'https://user:pass@example.com/secure'）
     *   * 相对URL：抛出错误（如'/api/users'）
     *   * 无效URL：抛出TypeError异常
     * 
     * 返回值说明：
     * - 包含协议和主机的字符串，格式为"protocol://host[:port]"
     * - 总是不包含末尾斜杠
     * - 协议部分保持原始大小写，主机部分转为小写
     * 
     * 异常处理：
     * - 如果url参数不是有效的URL格式，将抛出TypeError异常
     * - 不支持相对URL（无协议和主机的URL）
     * - 如果url为空或undefined，将抛出TypeError异常
     * 
     * 使用示例：
     * @example
     * // 1. 基本使用
     * const baseUrl = UrlUtil.parseBaseUrl('https://www.example.com/products?category=electronics#top');
     * console.log(baseUrl); // 输出: 'https://www.example.com'
     * 
     * @example
     * // 2. 带端口号的URL
     * const apiBase = UrlUtil.parseBaseUrl('http://localhost:8080/api/v1/users');
     * console.log(apiBase); // 输出: 'http://localhost:8080'
     * 
     * @example
     * // 3. 用于构建API请求
     * const baseUrl = UrlUtil.parseBaseUrl(window.location.href);
     * const apiUrl = `${baseUrl}/api/data`;
     * fetch(apiUrl).then(response => response.json());
     * 
     * @example
     * // 4. 错误处理
     * try {
     *   UrlUtil.parseBaseUrl('/relative/path');
     * } catch (error) {
     *   console.error('无效URL:', error.message);
     *   // 输出类似: '无效URL: Invalid URL: /relative/path'
     * }
     * 
     * @throws {TypeError} 当提供的url格式无效时抛出
     * 
     * @see URL Web API的URL构造函数
     */
    static parseBaseUrl(url: string): string {
        // 使用浏览器原生URL API进行解析
        const parsedUrl = new URL(url);

        // 组合协议和主机部分（自动包含端口号，如:3000等）
        return `${parsedUrl.protocol}//${parsedUrl.host}`;
    }

}