import $ from "jquery";

// 使用localStorage存储上次的输入记录，这个是用来存储数据的key
const historyLocalStorageKey = "fast-go-history";

/**
 * 把用户的输入保存到本地一份
 */
export default class HistoryManager {
    /**
     * 将当前表单的输入持久化到本地存储
     * 
     * @description
     * 功能描述：
     * 获取页面中group_id、article_id和version三个输入框的值，
     * 并将其序列化为JSON格式保存到浏览器的localStorage中
     * 
     * 适用场景：
     * - 用户输入表单数据后，需要保存这些输入以便用户下次访问时恢复
     * - 作为自动保存机制的一部分，在用户输入时实时保存
     * 
     * 边界条件：
     * - 依赖jQuery库获取DOM元素
     * - 依赖浏览器的localStorage API
     * - localStorage存储空间有限（通常为5MB左右）
     * - 数据以明文方式存储，不适合保存敏感信息
     * 
     * 异常处理：
     * - 如果localStorage不可用（如隐私模式或已满），可能会静默失败
     * 
     * 使用示例：
     * ```typescript
     * // 手动触发保存
     * HistoryManager.persistHistory();
     * 
     * // 绑定到输入事件
     * $("#group_id").on("input", HistoryManager.persistHistory);
     * ```
     * 
     * @returns {void} 此方法无返回值
     */
    static persistHistory(): void {
        let groupId = $("#group_id").val() as string;
        let articleId = $("#article_id").val() as string;
        let version = $("#version").val() as string;
        localStorage.setItem(historyLocalStorageKey, JSON.stringify({
            groupId,
            articleId,
            version,
        }));
    }

    /**
     * 启用历史记录功能
     * 
     * @description
     * 功能描述：
     * 1. 为输入框绑定实时保存事件，使用户每次输入都会保存到localStorage
     * 2. 从localStorage中恢复上次保存的输入数据，填充到对应的输入框中
     * 
     * 适用场景：
     * - 页面初始化时，需要恢复用户上次的输入状态
     * - 提升用户体验，避免用户重复输入相同信息
     * 
     * 边界条件：
     * - 依赖jQuery库
     * - 依赖浏览器的localStorage API
     * - 应在DOM加载完成后调用
     * 
     * 异常处理：
     * - 如果localStorage中无历史数据，则不恢复
     * - 如果JSON解析失败，则会抛出异常，但代码中未捕获
     * 
     * 使用示例：
     * ```typescript
     * // 在页面加载完成后启用历史记录功能
     * $(document).ready(() => {
     *   HistoryManager.enableHistory();
     * });
     * 
     * // 在特定容器中启用历史记录功能
     * $("#quick-jump-container").on("load", () => {
     *   HistoryManager.enableHistory();
     * });
     * ```
     * 
     * @returns {void} 此方法无返回值
     */
    static enableHistory(): void {
        // 绑定输入时实时保存
        $("#group_id,#article_id,#version").on("input", this.persistHistory);

        // 恢复历史记录
        const lastInput = localStorage.getItem(historyLocalStorageKey);
        if (lastInput) {
            const parsedInput = JSON.parse(lastInput);

            if (parsedInput.groupId) {
                $("#group_id").val(parsedInput.groupId);
            }
            if (parsedInput.articleId) {
                $("#article_id").val(parsedInput.articleId);
            }
            if (parsedInput.version) {
                $("#version").val(parsedInput.version);
            }
        }
    }
}