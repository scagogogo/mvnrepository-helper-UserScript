import $ from "jquery";
import StringUtil from "../../utils/StringUtil";

/**
 * 如果文本有折叠的情况，则需要将其展开
 *
 * 示例：
 * const text = "https://repo1.maven.org/maven2/org/wso2/carbon/apimgt/org.wso2.carbon.apimgt.hostobjects.oidc.feature/6.5.348/";
 * expandText(text); // 展开后的文本
 *
 * @param text - 需要展开的文本
 */
export default class ExpandTextUtil {
    static expandText(): void {
        // 如果有出现a连接中文字过长被折叠的情况，则将其还原
        // 比如： <url id="cuo925tkfv3tb3bcogk0" type="url" status="failed" title="" wc="0">https://repo1.maven.org/maven2/org/wso2/carbon/apimgt/org.wso2.carbon.apimgt.hostobjects.oidc.feature/6.5.348/</url>
        let maxWidth = 0;
        let isNeedShow = false;

        // 先遍历第一遍，计算出需要对齐的长度
        $("a").each((index, e) => {
            const jElement = $(e);
            const title = jElement.attr("title");
            if (!title) {
                return;
            }
            let count = title.length + this.alreadyFillWhitespaceCount(e?.nextSibling?.nodeValue);
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
                const title = jElement.attr("title");
                if (!title) {
                    return;
                }

                // 链接文本替换
                jElement.text(title);
                // 后面的节点填充必要的空格
                const needFillCharCount = maxWidth - title.length - this.alreadyFillWhitespaceCount(e?.nextSibling?.nodeValue);
                e!.nextSibling!.nodeValue = StringUtil.repeat(" ", needFillCharCount) + (e?.nextSibling?.nodeValue || "");
            });
        }
    }

    /**
     * 看看现在已经有多少个空格了
     *
     * 示例：
     * const nextSiblingNodeValue = "   next text";
     * alreadyFillWhitespaceCount(nextSiblingNodeValue); // 返回 3
     *
     * @param nextSiblingNodeValue - 下一个text node的值，从这里统计已经有的空格的长度
     * @returns 已填充的空格数量
     */
    static alreadyFillWhitespaceCount(nextSiblingNodeValue: string | null | undefined): number {
        let count = 0;
        if (!nextSiblingNodeValue) {
            return count;
        }
        for (const c of nextSiblingNodeValue) {
            if (c !== ' ') {
                break;
            }
            count++;
        }
        return count;
    }
}