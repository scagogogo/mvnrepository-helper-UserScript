const {isInComponentDetailPage, parseGAV} = require("../../../envs/detect-current-page");
const {randomId} = require("../../../utils/id-util");
const {resolveJarJdkVersion} = require("../detector/jar-jdk-version-detector");

/**
 * 组件详情页的增强
 */
function initComponentDetailPageJarJdkVersion() {

    if (!isInComponentDetailPage()) {
        return;
    }

    // TODO 2024-11-23 01:06:27 重构为使用jQuery

    // 获取表格，插入一行编译使用的JDK版本
    const tbodyElt = document.querySelector('.content table.grid tbody');

    // 表格加一行
    const lineElt = document.createElement('tr');
    tbodyElt.appendChild(lineElt);

    // 左边的列
    const jdkVersionNameColumnElt = document.createElement('th');
    jdkVersionNameColumnElt.style = 'width: 12em;';
    jdkVersionNameColumnElt.textContent = 'Build JDK Version';
    lineElt.appendChild(jdkVersionNameColumnElt);

    // 右边的列
    const jdkVersionValueColumnElt = document.createElement('td');
    const id = randomId();
    jdkVersionValueColumnElt.id = id;
    lineElt.appendChild(jdkVersionValueColumnElt);

    // 解析当前版本对应的JDK Version
    const {groupId, artifactId, version} = parseGAV(window.location.href);
    resolveJarJdkVersion(groupId, artifactId, version, id);

}

// TODO 2024-11-23 00:57:46 判断Jar包的编译版本

module.exports = {
    initComponentDetailPageJarJdkVersion
}
