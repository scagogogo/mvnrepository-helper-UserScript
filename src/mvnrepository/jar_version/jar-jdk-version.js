const {randomId} = require("../../utils/id-util");
const JSZip = require("jszip");
const {initComponentDetailPageJarJdkVersion} = require("./page/component-detail-page");
const {initComponentVersionListPageJarJdkVersion} = require("./page/component-list-page");

/**
 *初始化
 */
function initJarJdkVersion() {
    initComponentDetailPageJarJdkVersion();
    initComponentVersionListPageJarJdkVersion();
}

module.exports = {
    initJarJdkVersion
}

