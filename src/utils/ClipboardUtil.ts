import {logger} from "../logger/Logger";

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
     * 
     * @param text - 要写入剪贴板的文本内容，必须是字符串类型
     *               支持多语言文本，包括表情符号和特殊字符
     *               （示例："🧙♂️魔法文本✨", "12345", "https://example.com"）
     * @returns {Promise<void>} 返回Promise对象，可通过then/catch处理成功/失败状态
     *
     * @throws {DOMException} 当没有剪贴板写入权限或遇到安全限制时抛出异常
     * @throws {Error} 在旧版浏览器或不支持Clipboard API的环境中抛出错误
     * 
     * 方法功能描述：
     * -----------
     * 将指定文本内容写入到系统剪贴板中，用户可以在其他地方粘贴此内容。
     * 该方法使用现代的异步Clipboard API，而非传统的document.execCommand('copy')方法。
     * 
     * 安全限制：
     * - 必须在安全上下文(HTTPS或localhost)中运行
     * - 需要用户授予剪贴板访问权限（通常需要用户交互触发）
     * - 某些浏览器可能需要页面处于活动状态
     * 
     * 性能与兼容性：
     * - 操作速度快，通常在几毫秒内完成
     * - 仅支持现代浏览器，IE不支持
     * - 移动端兼容性有限，iOS可能有额外限制
     * 
     * 错误处理：
     * 1. 浏览器不支持：抛出普通Error
     * 2. 权限被拒绝：抛出DOMException
     * 3. 参数类型错误：抛出TypeError
     * 
     * 使用示例：
     * @example
     * // 在按钮点击事件中使用
     * copyButton.addEventListener('click', async () => {
     *   try {
     *     await ClipboardUtil.setContent('要复制的文本');
     *     showSuccessMessage('复制成功！');
     *   } catch (error) {
     *     showErrorMessage('复制失败：' + error.message);
     *   }
     * });
     * 
     * @example
     * // 复制JSON数据
     * const data = { name: '张三', age: 30 };
     * try {
     *   await ClipboardUtil.setContent(JSON.stringify(data, null, 2));
     *   console.log('JSON数据已复制到剪贴板');
     * } catch (error) {
     *   console.error('无法复制JSON数据:', error);
     * }
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
            logger.debug(`剪切板内容已更新为：${text}`);

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
                logger.error(errorMessage);
                throw new DOMException(errorMessage, err.name);
            }

            // 处理未知错误
            const errorMessage = `无法使用剪切板写入功能: ${err instanceof Error ? err.message : '未知错误'}`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}

