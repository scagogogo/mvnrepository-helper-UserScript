const {randomId} = require("../../../utils/id-util");
const JSZip = require("jszip");
const {isInComponentVersionListPage} = require("../../../envs/detect-current-page");
const {resolveJarJdkVersion} = require("../detector/jar-jdk-version-detector");


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

    // TODO 增加一个缓存，解析过一次的就不需要再重复解析了
    $(tableElt).find('tbody tr td').each((index, element) => {
        const versionLink = $(element).find('.vbtn');
        if (versionLink.length !== 1) {
            return;
        }
        const version = versionLink.text();
        const id = randomId();
        $(element).after(() => {
            return "<td id=" + id + "></td>";
        });
        resolveJarJdkVersion(groupId, artifactId, version, id);
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
    const header = `<th align="center">Build JDK Version</th>`;
    $(tableElt).find('thead tr th:contains("Version")').after(() => header);
}


module.exports = {
    initComponentVersionListPageJarJdkVersion
}
