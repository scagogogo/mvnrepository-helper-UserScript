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
    /**
     * 展开页面中被折叠的链接文本，并对齐后续文本
     * 
     * @description
     * 功能描述：
     * 1. 查找页面中所有具有title属性的链接(<a>标签)
     * 2. 如果链接的显示文本与title属性不同，则将显示文本替换为完整的title内容
     * 3. 计算所有链接的最大宽度，并在每个链接后添加适当的空格，使后续文本对齐
     * 
     * 适用场景：
     * - 页面中有被截断或折叠的URL链接需要展开显示
     * - 需要保持链接后的文本对齐，提高页面可读性
     * 
     * 边界条件：
     * - 依赖jQuery库
     * - 在DOM加载完成后调用
     * - 性能与页面中<a>标签数量相关
     * 
     * 使用示例：
     * ```typescript
     * // 在页面加载完成后调用
     * $(document).ready(() => {
     *   ExpandTextUtil.expandText();
     * });
     * 
     * // 或在特定事件触发后调用
     * $("#expand-button").click(() => {
     *   ExpandTextUtil.expandText();
     * });
     * ```
     * 
     * @returns {void} 此方法无返回值
     */
    static expandText(): void {
        // 如果有出现a连接中文字过长被折叠的情况，则将其还原
        // 比如： <url id="cuo925tkfv3tb3bcogk0" type="url" status="failed" title="" wc="0">https://repo1.maven.org/maven2/org/wso2/carbon/apimgt/org.wso2.carbon.apimgt.hostobjects.oidc.feature/6.5.348/</url>
        let maxWidth = 0;
        let isNeedShow = false;

        // 先遍历第一遍，计算出需要对齐的长度
        $("a").each((index: number, e: HTMLElement) => {
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
            $("a").each((index: number, e: HTMLElement) => {
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
     * 计算字符串开头连续空格的数量
     * 
     * @description
     * 功能描述：
     * 统计字符串开头有多少个连续的空格字符，遇到第一个非空格字符停止计数
     * 
     * 适用场景：
     * - 需要计算文本前导空格数量以进行对齐
     * - 在处理格式化文本时需要了解缩进级别
     * 
     * 边界条件：
     * - 对于null或undefined的输入，返回0
     * - 空字符串返回0
     * - 仅计算开头的空格，忽略其他空白字符（如制表符、换行符）
     * 
     * @param {string | null | undefined} nextSiblingNodeValue - 要检查的文本内容
     *        可以为null或undefined，此时返回0
     *        通常是DOM节点的文本内容，特别是链接元素的下一个兄弟节点的文本值
     * 
     * @returns {number} 字符串开头连续空格的数量
     *        - 0: 表示没有前导空格或输入为null/undefined/空字符串
     *        - 正整数: 表示连续空格的数量
     * 
     * 使用示例：
     * ```typescript
     * // 示例1: 计算普通字符串中的前导空格
     * const text1 = "   Hello World";
     * const count1 = ExpandTextUtil.alreadyFillWhitespaceCount(text1); // 返回 3
     * 
     * // 示例2: 处理没有前导空格的字符串
     * const text2 = "NoLeadingSpaces";
     * const count2 = ExpandTextUtil.alreadyFillWhitespaceCount(text2); // 返回 0
     * 
     * // 示例3: 处理全是空格的字符串
     * const text3 = "     ";
     * const count3 = ExpandTextUtil.alreadyFillWhitespaceCount(text3); // 返回 5
     * 
     * // 示例4: 处理null值
     * const count4 = ExpandTextUtil.alreadyFillWhitespaceCount(null); // 返回 0
     * ```
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