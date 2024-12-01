const {enableHistory} = require("./history");

/**
 * 在页面上添加快速跳转
 */
function addQuickJump() {

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

    enableHistory();

}


module.exports = {
    addQuickJump,
}
