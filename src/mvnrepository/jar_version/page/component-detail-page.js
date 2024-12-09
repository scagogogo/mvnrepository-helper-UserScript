const {isInComponentDetailPage, parseGAV} = require("../../../envs/detect-current-page");
const {randomId} = require("../../../utils/id-util");
const {resolveJarJdkVersion} = require("../detector/jar-jdk-version-detector");

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
    jdkVersionNameColumnElt.style = 'width: 12em;';
    jdkVersionNameColumnElt.textContent = 'Build JDK Version';
    lineElt.appendChild(jdkVersionNameColumnElt);

    // 新增行右边的列，展示任务的一些结果与状态
    const jdkVersionValueColumnElt = document.createElement('td');
    const id = randomId();
    jdkVersionValueColumnElt.id = id;
    lineElt.appendChild(jdkVersionValueColumnElt);

    // 解析当前页面的组件版本对应的JDK Version并展示，调用底下统一的工具方法
    const {groupId, artifactId, version} = parseGAV(window.location.href);
    resolveJarJdkVersion(groupId, artifactId, version, id);
}

module.exports = {
    initComponentDetailPageJarJdkVersion
}
