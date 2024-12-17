const {randomId} = require("../../../utils/id-util");
const JSZip = require("jszip");
const {isInComponentVersionListPage} = require("../../../envs/detect-current-page");
const {resolveJarJdkVersion} = require("../detector/jar-jdk-version-detector");
const {buildGavJarPath} = require("../../../utils/mvn-util");
const {
    findRepoInformationStorage,
    findRepoInformation,
    RepoInformation, saveRepoInformation
} = require("../../../database/repo-information-storage");


/**
 * 当前是否在组件的版本列表页面
 *
 * 比如： https://mvnrepository.com/artifact/org.projectlombok/lombok
 */
function initComponentVersionListPageJarJdkVersion() {

    if (!isInComponentVersionListPage()) {
        return;
    }

    addComponentVersionListPageJarJdkVersion();

}

/**
 * 修改页面的表格，给版本列表的表格加一列jdk的版本
 *
 * 比如： https://mvnrepository.com/artifact/org.projectlombok/lombok
 */
function addComponentVersionListPageJarJdkVersion() {

    const table = $('.gridcontainer table.versions');

    // 增加表头
    addTableHeader(table);

    // 遍历每一行，开始读取解析
    addTableValue(table);

}

/**
 * 展示解析到的值
 *
 * @param tableElt
 * @returns {Promise<void>}
 */
async function addTableValue(tableElt) {

    const {groupId, artifactId} = parseGroupIdAndArtifactId();

    $(tableElt).find('tbody tr td').each((index, element) => {

        // 寻找到版本详情页的链接，围绕着这个链接修改页面布局
        const versionLink = $(element).find('.vbtn');
        if (versionLink.length !== 1) {
            return;
        }

        // 获取jar包对应仓库的链接
        const repoDetailPageRequestPath = $(element).next().next().find("a").attr("href");

        const version = versionLink.text();
        const id = randomId();
        $(element).after(() => {
            return "<td id=" + id + "></td>";
        });

        processSingle(groupId, artifactId, version, id, repoDetailPageRequestPath);

    });

}

/**
 * 处理单个的版本号
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param id
 * @param repoDetailPageRequestPath
 * @returns {Promise<void>}
 */
async function processSingle(groupId, artifactId, version, id, repoDetailPageRequestPath) {

    const repoInformation = await findRepoInformation(repoDetailPageRequestPath);
    if (repoInformation) {
        const jarUrl = repoInformation.baseUrl + buildGavJarPath(groupId, artifactId, version);
        await resolveJarJdkVersion(groupId, artifactId, version, id, jarUrl);
        return;
    }

    // 发送请求，拿详情页的仓库地址
    $.ajax({
        url: repoDetailPageRequestPath,
        type: "GET",
        success: function (data) {
            const repoBaseUrl = $(data).find(".im-subtitle").text();

            // 保存一下仓库信息
            const repoInformation = new RepoInformation()
            repoInformation.id = repoDetailPageRequestPath;
            repoInformation.baseUrl = repoBaseUrl;
            saveRepoInformation(repoInformation);

            const jarUrl = repoBaseUrl + buildGavJarPath(groupId, artifactId, version);
            resolveJarJdkVersion(groupId, artifactId, version, id, jarUrl);
        },
        error: function (error) {
            // 请求失败时的回调函数
            console.error(error);
        }
    });
}

/**
 * 解析页面中的GroupId和ArtifactId
 *
 * @returns {{groupId: null, artifactId: null}}
 */
function parseGroupIdAndArtifactId() {

    let groupId = null;
    let artifactId = null;

    const split = $('.breadcrumb').text().split(' » ');
    if (split.length >= 2) {
        groupId = split[1].trim();
    }
    if (split.length >= 3) {
        artifactId = split[2].trim();
    }

    return {
        groupId,
        artifactId
    }
}

/**
 * 增加表头，与原有内容的样式保持一致
 *
 * @param tableElt
 */
function addTableHeader(tableElt) {
    // 新增行左边的标题列，样式与页面上原有的内容的样式保持一致
    const jdkVersionNameColumnElt = document.createElement('th');
    const columnTitleElt = document.createElement("span");
    columnTitleElt.style = 'width: 12em;';
    columnTitleElt.textContent = 'Build JDK Version';
    jdkVersionNameColumnElt.appendChild(columnTitleElt);
    // 问号提示
    const documentTips = document.createElement("a");
    documentTips.textContent = "?";
    documentTips.style = "margin-left: 5px; border-radius: 50%; border: 2px solid black; width: 20px; display: inline-block; text-align: center; cursor: pointer; ";
    documentTips.href = "https://github.com/scagogogo/mvnrepository-helper-UserScript";
    documentTips.target = "_blank";
    jdkVersionNameColumnElt.appendChild(documentTips);
    // const header = `<th align="center">Build JDK Version</th>`;
    $(tableElt).find('thead tr th:contains("Version")').after(() => jdkVersionNameColumnElt);
}


module.exports = {
    initComponentVersionListPageJarJdkVersion
}
