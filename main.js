// ==UserScript==
// @name         repo1.maven.org Helper
// @namespace    https://github.com/scagogogo/maven-repo1-helper-UserScript
// @version      0.1
// @description  用于辅助使用maven中央仓库
// @document
// @author       CC11001100
// @match       *://repo1.maven.org/*
// @run-at document-idle
// @require https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @grant       none
// ==/UserScript==
(() => {

    const historyLocalStorageKey = "fast-go-history";

    // 在页面上添加快速跳转的表单
    const btnHtml = `
<fieldset title="Maven Helper" style="padding: 50px; position=fixed; display: block; border: 1px solid #CCC; border-radius: 3px; margin: 50px 10px 50px 10px; color: #AAA; ">
    <legend><a href="https://github.com/scagogogo/maven-repo1-helper-UserScript" style="color: #BBB; text-decoration: none; ">Maven Helper</a></legend>
    <table style="border-spacing: 15px;">
        <tr>
            <td><label for="group_id">Group ID: </label></td>
            <td><input id="group_id" placeholder="group id" style="width: 300px; height: 30px;" autocomplete="true" tabindex="10086"></td>
            <td rowspan="3" style="padding-left: 30px; align-content: center;">
                <button id="go" style="width: 100px; height: 100px; font-size: 25px; border-radius: 50px; cursor: pointer; border-width: 0px; color: #AAA; ">&nbsp;Go!&nbsp;</button>
            </td>
        </tr>
        <tr>
            <td><label for="article_id">Article ID: </label></td>
            <td><input id="article_id" placeholder="article id" style="width: 300px; height: 30px;" tabindex="10087"></td>
        </tr>
        <tr>
            <td><label for="version">Version:</label></td>
            <td> <input id="version" placeholder="version" style="width: 300px; height: 30px;" tabindex="10088"></td>
        </tr>
    </table>
</fieldset>
    `;
    $("body").append($(btnHtml));

    // 绑定事件
    function go(e) {

        // 从页面元素中获取输入值
        let groupId = $("#group_id").val();
        let articleId = $("#article_id").val();
        let version = $("#version").val();

        // 参数校验
        if (!groupId) {
            alert("Group ID can not empty");
            return;
        }

        // 保存历史记录，保存分割之前的，不然要手动清除很麻烦
        localStorage.setItem(historyLocalStorageKey, JSON.stringify({
            groupId,
            articleId,
            version,
        }));

        // 如果Group ID是冒号的话则将其拆分一下
        // 支持直接在GroupID中输入： org.apache.maven.plugins:maven-dependency-plugin:3.5.0 这种形式
        if (groupId.indexOf(":") !== -1) {
            let split = groupId.split(":", 3);
            groupId = split[0]
            if (split.length >= 2 && !articleId) {
                articleId = split[1]
            }
            if (split.length >= 3 && !version) {
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
        $("#group_id").val(lastInput["groupId"]);
        $("#article_id").val(lastInput["articleId"]);
        $("#version").val(lastInput["version"]);
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
        if (title.length > maxWidth) {
            maxWidth = title.length;
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
            // 链接的文本替换
            jElement.text(title);
            const spanHtml = `${repeat(" ", maxWidth - title.length)}`;
            jElement.after(spanHtml);
        });
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

