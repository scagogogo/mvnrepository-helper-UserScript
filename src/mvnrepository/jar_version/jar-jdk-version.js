const {randomId} = require("../../utils/id-util");
const JSZip = require("jszip");
const {initComponentDetailPageJarJdkVersion} = require("./page/component-detail-page");
const {initComponentVersionListPageJarJdkVersion} = require("./page/component-list-page");

/**
 * 初始化展示Jar版本
 */
function initJarJdkVersion() {

    // 组件详情页
    initComponentDetailPageJarJdkVersion();

    // 组件列表页
    initComponentVersionListPageJarJdkVersion();

}

module.exports = {
    initJarJdkVersion
}

