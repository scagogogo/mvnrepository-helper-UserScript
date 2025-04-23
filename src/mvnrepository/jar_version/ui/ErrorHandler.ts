/**
 * 错误信息展示工具类
 *
 * 使用示例：
 * @example
 * // 在任务元素下方显示错误信息
 * await ErrorHandler.show('task-123', '文件上传超时');
 */
export default class ErrorHandler {
    /**
     * 展示指定任务的错误信息
     *
     * @description
     * 功能描述：
     * 在指定DOM元素内创建或更新一个错误消息元素，用于向用户显示友好的错误提示。
     * 如果错误容器不存在会自动创建，如果已存在则更新其内容。
     * 
     * 适用场景：
     * - 显示文件下载或解析失败提示
     * - 展示网络请求错误信息
     * - 任何需要在UI中反馈错误状态的场景
     * 
     * 边界条件：
     * - 依赖DOM操作，需要在浏览器环境中使用
     * - 如果指定的父元素ID不存在，则不会显示错误信息
     * - 错误消息样式已预设，包括红色文本颜色和间距
     * 
     * @param {string} taskId - 需要关联的DOM元素ID，错误消息将作为其子元素显示
     *                          必须是页面上已存在的元素ID
     * @param {string} errorMsg - 要显示的错误信息内容，支持纯文本，不支持HTML
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 理论上可能抛出DOM操作相关错误，但方法内部未做异常处理
     * 
     * @example
     * // 基本用法：在ID为"download-container"的元素内显示错误
     * await ErrorHandler.show('download-container', '网络连接失败');
     * 
     * // 更新已存在的错误信息
     * await ErrorHandler.show('download-container', '重试次数已达上限');
     * 
     * // 错误信息可以包含详细的错误原因
     * try {
     *   await fetchResource();
     * } catch (error) {
     *   await ErrorHandler.show('result-display', `操作失败: ${error.message}`);
     * }
     */
    static async show(taskId: string, errorMsg: string): Promise<void> {
        const errorElementId = `${taskId}-error-msg`;
        let errorElement = document.getElementById(errorElementId);

        // 动态创建错误信息容器
        if (!errorElement) {
            errorElement = document.createElement("div");
            errorElement.id = errorElementId;
            errorElement.style.color = "#dc3545";
            errorElement.style.marginTop = "8px";
            errorElement.style.fontSize = "0.9em";

            const parentElement = document.getElementById(taskId);
            if (!parentElement) return;

            parentElement.appendChild(errorElement);
        }

        // 更新错误信息内容
        errorElement.textContent = errorMsg;
    }
}