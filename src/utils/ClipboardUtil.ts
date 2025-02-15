/**
 * 剪贴板操作工具类
 * 需要在HTTPS环境下运行，或者在本地开发时localhost
 *
 * @example
 * // 基本使用
 * ClipboardUtil.setContent('Hello World')
 *   .then(() => console.log('复制成功'))
 *   .catch(err => console.error('复制失败:', err));
 *
 * @example
 * // 异常处理示例
 * try {
 *   await ClipboardUtil.setContent('Secure data');
 *   console.log('敏感信息已安全复制');
 * } catch (error) {
 *   console.error('复制安全信息失败:', error);
 * }
 */
export default class ClipboardUtil {

    /**
     * 设置剪贴板内容
     * @param text - 要写入剪贴板的文本内容，必须是字符串类型
     *               支持多语言文本，包括表情符号和特殊字符
     *               （示例："🧙♂️魔法文本✨", "12345", "https://example.com"）
     * @returns {Promise<void>} 返回Promise对象，可通过then/catch处理成功/失败状态
     *
     * @throws {DOMException} 当没有剪贴板写入权限或遇到安全限制时抛出异常
     * @throws {Error} 在旧版浏览器或不支持Clipboard API的环境中抛出错误
     */
    static async setContent(text: string): Promise<void> {
        // 检查浏览器是否支持Clipboard API
        if (!('clipboard' in navigator)) {
            const message = 'Clipboard API 不可用，请使用现代浏览器或升级浏览器版本';
            console.error(message);
            throw new Error(message);
        }

        try {
            // 尝试写入剪贴板
            await navigator.clipboard.writeText(text);
            console.log(`剪切板内容已更新为：${text}`);

            // 成功时无返回值，但Promise会resolve
        } catch (err) {
            // 处理TypeError（传入非字符串参数时）
            if (err instanceof TypeError) {
                const errorMessage = `传入参数类型错误，应为字符串类型，实际传入类型：${typeof text}`;
                console.error(errorMessage);
                throw new TypeError(errorMessage);
            }

            // 处理其他DOM异常（如权限被拒绝）
            if (err instanceof DOMException) {
                const errorMessage = `剪贴板操作被拒绝：${err.message}`;
                console.error(errorMessage);
                throw new DOMException(errorMessage, err.name);
            }

            // 处理未知错误
            const errorMessage = `无法使用剪切板写入功能: ${err instanceof Error ? err.message : '未知错误'}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}

