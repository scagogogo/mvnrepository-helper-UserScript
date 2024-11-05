// 使用localStorage存储上次的输入记录，这个是用来存储数据的key
const historyLocalStorageKey = "fast-go-history";

/**
 * 把用户的输入保存到本地一份
 */
function persistHistory() {
    let groupId = $("#group_id").val();
    let articleId = $("#article_id").val();
    let version = $("#version").val();
    localStorage.setItem(historyLocalStorageKey, JSON.stringify({
        groupId,
        articleId,
        version,
    }));
}

function enableHistory() {
    // 绑定输入时实时保存
    $("#group_id,#article_id,#version").on("input", persistHistory);

// 恢复历史记录
    let lastInput = localStorage.getItem(historyLocalStorageKey);
    if (lastInput) {
        lastInput = JSON.parse(lastInput);
        $("#group_id").val(lastInput["groupId"] || "");
        $("#article_id").val(lastInput["articleId"] || "");
        $("#version").val(lastInput["version"] || "");
    }
}

module.exports = {
    enableHistory
}



