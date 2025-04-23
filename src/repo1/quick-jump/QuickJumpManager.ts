import $ from "jquery";
import HistoryManager from "./HistoryManager";

/**
 * 在页面上添加快速跳转
 */
export default class QuickJumpManager {
    /**
     * 在页面上添加Maven构件快速跳转功能
     * 
     * @description
     * 功能描述：
     * 1. 在页面上动态创建一个表单，包含GroupID、ArtifactID和Version三个输入字段
     * 2. 为表单添加提交按钮和相关事件处理
     * 3. 根据用户输入构建Maven仓库URL并进行跳转
     * 4. 支持多种输入格式解析，包括标准格式和冒号分隔的shorthand格式
     * 5. 整合历史记录功能，保存和恢复用户输入
     * 
     * 适用场景：
     * - 需要快速跳转到Maven仓库中特定构件的页面
     * - 用户经常访问不同的Maven构件，需要便捷的导航工具
     * - 作为开发工具的辅助功能，提高Maven仓库浏览效率
     * 
     * 边界条件：
     * - 依赖jQuery库进行DOM操作
     * - 依赖HistoryManager来实现历史记录功能
     * - 应在DOM加载完成后调用
     * - URL格式为标准的Maven仓库URL结构
     * 
     * 异常处理：
     * - 对缺少必要参数的情况进行验证和提示
     * - 对参数格式错误进行检查并提示用户
     * 
     * 使用示例：
     * ```typescript
     * // 在页面加载完成后添加快速跳转功能
     * $(document).ready(() => {
     *   QuickJumpManager.addQuickJump();
     * });
     * 
     * // 或在特定时机添加
     * $("#add-helper-button").click(() => {
     *   QuickJumpManager.addQuickJump();
     * });
     * ```
     * 
     * @returns {void} 此方法无返回值
     */
    static addQuickJump(): void {
        // 在页面上添加快速跳转的表单
        const btnHtml = `
        <fieldset title="Maven Helper" style="padding: 50px; position: fixed; display: block; border: 1px solid #CCC; border-radius: 3px; margin: 50px 10px 50px 10px; color: #AAA; ">
            <legend><a href="https://github.com/scagogogo/maven-repo1-helper-UserScript" style="color: #BBB; text-decoration: none; ">Maven Helper</a></legend>
            <table style="border-spacing: 15px;">
                <tr>
                    <td><label for="group_id">Group ID: </label></td>
                    <td><input id="group_id" placeholder="group id, example: org.apache.dubbo" style="width: 300px; height: 30px;" autocomplete="true" tabindex="10086"></td>
                    <td rowspan="3" style="padding-left: 30px; align-content: center;">
                        <button id="go" style="width: 100px; height: 100px; font-size: 25px; border-radius: 50px; cursor: pointer; border-width: 0px; color: #AAA; ">&nbsp;Go!&nbsp;</button>
                    </td>
                </tr>
                <tr>
                    <td><label for="article_id">Article ID: </label></td>
                    <td><input id="article_id" placeholder="article id, example: dubbo" style="width: 300px; height: 30px;" tabindex="10087"></td>
                </tr>
                <tr>
                    <td><label for="version">Version:</label></td>
                    <td> <input id="version" placeholder="version, example: 3.2.4" style="width: 300px; height: 30px;" tabindex="10088"></td>
                </tr>
            </table>
        </fieldset>
        `;
        $("body").append($(btnHtml));

        // 绑定事件
        $("#go").click((e: JQuery.ClickEvent) => {
            // 从页面元素中获取输入值
            let groupId: string | null = null;
            let articleId: string | null = null;
            let version: string | null = null;

            const groupIdVal = $("#group_id").val();
            if (typeof groupIdVal === "string") {
                groupId = groupIdVal.trim();
            }

            const articleIdVal = $("#article_id").val();
            if (typeof articleIdVal === "string") {
                articleId = articleIdVal.trim();
            }

            const versionVal = $("#version").val();
            if (typeof versionVal === "string") {
                version = versionVal.trim();
            }

            // 参数校验
            if (!groupId) {
                alert("Group ID can not be empty");
                return;
            }

            // 如果Group ID是冒号分隔的形式，则将其拆分
            if (groupId?.indexOf(":") !== -1) {
                const split = groupId.split(":");

                // GroupID中的冒号超过了两个，为不允许的值
                if (split.length > 3) {
                    alert(`GroupID can be in one of the following formats: 
- GroupId
- GroupId:ArtifactId
- GroupId:ArtifactId:Version
The value ${groupId} you input does not conform to any of the above formats
                    `);
                    return;
                }

                // 重写自己的值
                groupId = split[0];

                // 尝试从GroupID中获取ArtifactID
                if (split.length >= 2) {
                    if (articleId) {
                        alert("ArtifactID is specified in both GroupID and ArtifactID");
                        return;
                    }
                    articleId = split[1];
                }

                // 尝试从GroupID中获取version
                if (split.length >= 3) {
                    if (version) {
                        alert("Version is specified in both GroupID and Version");
                        return;
                    }
                    version = split[2];
                }
            }

            // 组装URL，开始跳转
            let targetUrl = `https://repo1.maven.org/maven2/${groupId?.replace(/\./g, "/")}/`;
            if (articleId) {
                targetUrl += `${articleId}/`;
            }
            if (version) {
                targetUrl += `${version}/`;
            }
            document.location = targetUrl;
        });

        // 在输入的时候随时能够按回车也跳转
        $("#group_id,#article_id,#version").keyup((e: JQuery.KeyUpEvent) => {
            if (e.keyCode === 13) {
                $("#go").click();
            }
        });

        HistoryManager.enableHistory();
    }
}