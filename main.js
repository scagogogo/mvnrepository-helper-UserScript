// ==UserScript==
// @name         repo1.maven.org Helper
// @namespace    https://github.com/scagogogo/maven-repo1-helper-UserScript
// @version      0.2
// @description  用于辅助使用maven中央仓库
// @document
// @author       CC11001100
// @match       *://repo1.maven.org/*
// @run-at document-idle
// @require https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant       none
// @license MIT
// ==/UserScript==
(() => {

    // 使用localStorage存储上次的输入记录，这个是用来存储数据的key 
    const historyLocalStorageKey = "fast-go-history";

    // 在页面上添加快速跳转的表单
    const btnHtml = `
<fieldset title="Maven Helper" style="padding: 50px; position=fixed; display: block; border: 1px solid #CCC; border-radius: 3px; margin: 50px 10px 50px 10px; color: #AAA; ">
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

    // 绑定输入时实时保存 
    $("#group_id,#article_id,#version").on("input", persistHistory);


    // 绑定事件
    function go(e) {

        // 从页面元素中获取输入值
        let groupId = $("#group_id").val().trim();
        let articleId = $("#article_id").val().trim();
        let version = $("#version").val().trim();

        // 参数校验
        if (!groupId) {
            alert("Group ID can not empty");
            return;
        }

        // 如果Group ID是冒号的话则将其拆分一下
        // 支持直接在GroupID中输入： org.apache.maven.plugins:maven-dependency-plugin:3.5.0 这种形式
        if (groupId.indexOf(":") !== -1) {

            let split = groupId.split(":");

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
            groupId = split[0]

            // 尝试从GroupID中获取ArtifactID
            if (split.length >= 2) {
                if (articleId) {
                    alert("ArtifactID is specified in both GroupID and ArtifactID");
                    return;
                }
                articleId = split[1]
            }

            // 尝试从GroupID中获取version
            if (split.length >= 3) {
                if (version) {
                    alert("Version is specified in both GroupID and Version");
                    return;
                }
                version = split[2]
            }

        }

        // 组装URL，开始跳转
        // let targetUrl = `https://repo1.maven.org/maven2/tiffrenderer/tiffrenderer/0.9/`
        let targetUrl = `https://repo1.maven.org/maven2/${groupId.replaceAll(".", "/")}/`
        if (articleId) {
            targetUrl += articleId + "/"
        }
        if (version) {
            targetUrl += version + "/"
        }
        document.location = targetUrl;
    }

    // 单击Go按钮的时候跳转
    $("#go").click(go);

    // 在输入的时候随时能够按回车也跳转
    $("#group_id,#article_id,#version").keyup(e => {
        if (e.keyCode === 13) {
            $("#go").click();
        }
    })

    // 恢复历史记录
    let lastInput = localStorage.getItem(historyLocalStorageKey);
    if (lastInput) {
        lastInput = JSON.parse(lastInput);
        $("#group_id").val(lastInput["groupId"] || "");
        $("#article_id").val(lastInput["articleId"] || "");
        $("#version").val(lastInput["version"] || "");
    }

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

    /**
     * 看看现在已经有多少个空格了 
     * 
     * @param {下一个text node的值，从这里统计已经有的空格的长度 } nextSiblingNodeValue 
     * @returns 
     */
    function alreadyFillWhitespaceCount(nextSiblingNodeValue) {
        let count = 0;
        for (let c of nextSiblingNodeValue) {
            if (c === '-') {
                break;
            }
            count++;
        }
        return count;
    }


    /**
     * 将text重复count次拼接为string返回
     *
     * @param text
     * @param count
     * @return {string}
     */
    function repeat(text, count) {
        const buff = [];
        for (let i = 0; i < count; i++) {
            buff.push(text)
        }
        return buff.join("");
    }

})();

