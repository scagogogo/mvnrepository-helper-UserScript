// 使用localStorage存储上次的输入记录，这个是用来存储数据的key
const historyLocalStorageKey = "fast-go-history";

/**
 * 把用户的输入保存到本地一份
 */
export default class HistoryManager {
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