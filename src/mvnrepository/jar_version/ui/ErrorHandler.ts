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
     * @param {string} taskId - 需要关联的DOM元素ID
     * @param {string} errorMsg - 要显示的错误信息内容
     * @returns {Promise<void>} 操作完成的Promise
     *
     * @example
     * // 在ID为"download-task"的元素下显示错误
     * ErrorHandler.show('download-task', '网络连接失败');
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