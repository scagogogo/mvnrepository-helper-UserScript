const {repeat} = require("../../utils/string-util");

/**
 * 如果文本有折叠的情况，则需要将其展开
 *
 * @param text
 */
function expandText(text) {

    // 如果有出现a连接中文字过长被折叠的情况，则将其还原
    // 比如： https://repo1.maven.org/maven2/org/wso2/carbon/apimgt/org.wso2.carbon.apimgt.hostobjects.oidc.feature/6.5.348/
    let maxWidth = 0;
    let isNeedShow = false;
    // 先遍历第一遍，计算出需要对齐的长度
    $("a").each((index, e) => {
        const jElement = $(e);
        const title = jElement.attr("title");
        if (!title) {
            return;
        }
        let count = title.length + alreadyFillWhitespaceCount(e.nextSibling.nodeValue);
        if (count > maxWidth) {
            maxWidth = count;
        }
        if (title !== jElement.text()) {
            isNeedShow = true;
        }
    });

    // 遍历第二遍开始替换
    if (isNeedShow) {
        $("a").each((index, e) => {
            const jElement = $(e);
            const title = jElement.attr("title")
            if (!title) {
                return;
            }

            // 链接文本替换
            jElement.text(title);
            // 后面的节点填充必要的空格
            const needFillCharCount = maxWidth - title.length - alreadyFillWhitespaceCount(e.nextSibling.nodeValue);
            e.nextSibling.nodeValue = repeat(" ", needFillCharCount) + e.nextSibling.nodeValue;

        });
    }
}

/**
 * 看看现在已经有多少个空格了
 *
 * @param {下一个text node的值，从这里统计已经有的空格的长度 } nextSiblingNodeValue
 * @returns
 */
function alreadyFillWhitespaceCount(nextSiblingNodeValue) {
    let count = 0;
    for (let c of nextSiblingNodeValue) {
        if (c !== ' ') {
            break;
        }
        count++;
    }
    return count;
}

module.exports = {
    expandText
}







