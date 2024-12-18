const {isInComponentDetailPage, parseGAV} = require("../../../envs/detect-current-page");
const {randomId} = require("../../../utils/id-util");
const {resolveJarJdkVersion} = require("../detector/jar-jdk-version-detector");
const {parseBaseUrl} = require("../../../utils/url-util");
const {buildGavJarPath} = require("../../../utils/mvn-util");
const {showErrorMsg} = require("../ui/error");

/**
 * 组件详情页的增强
 *
 * 比如： https://mvnrepository.com/artifact/org.projectlombok/lombok/1.18.36
 */
function initComponentDetailPageJarJdkVersion() {

    if (!isInComponentDetailPage()) {
        return;
    }

    addComponentDetailPageJarJdkVersion();

}

/**
 * 当前页面的表格增加一行，展示对应的Jar包的JDK编译信息
 *
 * 比如： https://mvnrepository.com/artifact/org.projectlombok/lombok/1.18.36
 */
function addComponentDetailPageJarJdkVersion() {
    // 获取表格，插入一行编译使用的JDK版本
    const tbodyElt = document.querySelector('.content table.grid tbody');

    // 表格加一行
    const lineElt = document.createElement('tr');
    tbodyElt.appendChild(lineElt);

    // 新增行左边的标题列，样式与页面上原有的内容的样式保持一致
    const jdkVersionNameColumnElt = document.createElement('th');
    const columnTitleElt = document.createElement("span");
    columnTitleElt.style = 'width: 12em; ';
    columnTitleElt.textContent = 'Build JDK Version';
    jdkVersionNameColumnElt.appendChild(columnTitleElt);
    // 问号提示
    const documentTips = document.createElement("a");
    documentTips.textContent = "?";
    documentTips.style = "margin-left: 5px; border-radius: 50%; border: 2px solid black; width: 20px; display: inline-block; text-align: center; cursor: pointer; ";
    documentTips.href = "https://github.com/scagogogo/mvnrepository-helper-UserScript";
    documentTips.target = "_blank";
    jdkVersionNameColumnElt.appendChild(documentTips);
    lineElt.append(jdkVersionNameColumnElt);

    // 新增行右边的列，展示任务的一些结果与状态
    const jdkVersionValueColumnElt = document.createElement('td');
    const id = randomId();
    jdkVersionValueColumnElt.id = id;
    lineElt.appendChild(jdkVersionValueColumnElt);

    // 解析Jar包的URL
    const jarUrl = parseJarUrl();
    if (!jarUrl) {
        showErrorMsg(id, "not found jar file");
        return;
    }

    // 解析当前页面的组件版本对应的JDK Version并展示，调用底下统一的工具方法
    const {groupId, artifactId, version} = parseGAV(window.location.href);

    resolveJarJdkVersion(groupId, artifactId, version, id, jarUrl);
}

/**
 * 解析Jar包的URL
 *
 * @returns {string | null}
 */
function parseJarUrl() {
    return $('a:contains("jar"):first').attr("href");
}

module.exports = {
    initComponentDetailPageJarJdkVersion
}
