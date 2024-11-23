const JSZip = require("jszip");
const {buildJarUrl} = require("../../../utils/mvn-util");
const {parseBuildJdkVersion} = require("../parser/manifest-parser");
const {parseClassBuildJdkVersionMetric} = require("../parser/jar-class-parser");
const {jdkVersionToHumanReadableString} = require("../../../utils/class-util");
const {showRequestJarProgress, removeRequestJarProgress} = require("../ui/jar-download-progress");
const {showAnalyzeJarClassResult} = require("../ui/jar-class-analyze");
const {showJarManifestAnalyzeResult} = require("../ui/jar-manifest-analyzer");
const {showErrorMsg} = require("../ui/error");

/**
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param elementId 要把进度及结果展示在哪个元素中
 * @returns {Promise<void>}
 */
async function resolveJarJdkVersion(groupId, artifactId, version, elementId) {

    // TODO 2024-11-24 00:35:28 读取本地缓存，如果命中了的话就直接展示本地缓存的结果

    // 请求Jar文件
    requestAndAnalyzeJarFile(groupId, artifactId, version, elementId);
}

/**
 * 请求和分析Jar包
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param elementId
 * @returns {Promise<void>}
 */
async function requestAndAnalyzeJarFile(groupId, artifactId, version, elementId) {
    const jarUrl = buildJarUrl(groupId, artifactId, version);
    // 使用GM_xmlhttpRequest下载JAR文件
    GM_xmlhttpRequest({
        method: "GET",
        url: jarUrl,
        responseType: "arraybuffer",
        onload: analyzeJarFile(elementId),
        onerror: showRequestJarFailedMessage(elementId, jarUrl),
        onprogress: await showRequestJarProgress(elementId),
    });
}

function analyzeJarFile(elementId) {
    return response => {

        debugger;

        removeRequestJarProgress(elementId);

        if (response.status === 200) {

            const jarFile = new JSZip(response.response);

            analyzeManifest(elementId, jarFile);

            analyzeJar(elementId, jarFile);

        } else {
            showErrorMsg(elementId, "download jar file error, response status " + response.status);
        }
    };
}

/**
 *
 * @param elementId
 * @param jarFile
 * @returns {Promise<void>}
 */
async function analyzeJar(elementId, jarFile) {
    // 开始分析整个Jar包中的字节码文件的情况
    const {metric, maxMajorVersion, maxMinorVersion} = parseClassBuildJdkVersionMetric(jarFile);
    showAnalyzeJarClassResult(elementId, metric, maxMajorVersion, maxMinorVersion);
}

/**
 *
 * 尝试从manifest中解析编译信息
 *
 * @param elementId
 * @param jarFile {JSZip}
 * @returns {Promise<void>}
 */
async function analyzeManifest(elementId, jarFile) {
    const metaFileName = 'META-INF/MANIFEST.MF';
    if (jarFile.files[metaFileName]) {
        const manifest = jarFile.files[metaFileName].asText();
        let {key, value} = parseBuildJdkVersion(manifest);
        console.log(manifest);
        showJarManifestAnalyzeResult(elementId, manifest, key, value);
    } else {
        showJarManifestAnalyzeResult(elementId, null, null, null);
    }
}


/**
 * 在页面上展示请求Jar文件失败的信息
 *
 * @param elementId
 * @param jarUrl
 * @param response
 * @returns {Promise<void>}
 */
function showRequestJarFailedMessage(elementId, jarUrl) {
    return response => {
        removeRequestJarProgress(elementId);
        // TODO 2024-11-24 00:37:08 展示更详细的错误信息
        document.getElementById(elementId).textContent = "failed to request Jar from " + jarUrl;
    };
}

/**
 * 根据gav解析jdk版本
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param callback 回调函数： (groupId, artifactId, version, jdkVersion, exceptionMsg) => {}
 */
async function resolveJdkVersion(groupId, artifactId, version, callback) {

    // TODO 2024-11-23 01:15:49 先从本地缓存中查找，找不到的情况下再下载Jar包解析

    const jarUrl = buildJarUrl(groupId, artifactId, version);
    // 使用GM_xmlhttpRequest下载JAR文件
    GM_xmlhttpRequest({
        method: "GET",
        url: jarUrl,
        responseType: "arraybuffer",
        onload: function (response) {
            if (response.status === 200) {
                const jar = new JSZip(this.response);

                // 先尝试从manifest中解析编译信息
                const metaFileName = 'META-INF/MANIFEST.MF';
                if (jar.files[metaFileName]) {
                    const manifest = jar.files[metaFileName].asText();
                    let jdkVersion = parseBuildJdkVersion(manifest);
                    console.log(manifest);
                    callback(groupId, artifactId, version, jdkVersion, null);
                }

                // 异步分析整个Jar文件
                (async () => {
                    // 开始分析整个Jar包中的字节码文件的情况
                    const {metric, maxMajorVersion, maxMinorVersion} = parseClassBuildJdkVersionMetric(jar);
                    if (maxMajorVersion) {
                        jdkVersion = jdkVersionToHumanReadableString(maxMajorVersion, maxMinorVersion);
                        callback(groupId, artifactId, version, jdkVersion, null);
                    }
                })();

            }
        },
        onerror: function (response) {
            console.error('Failed to download JAR:', response);
            callback(groupId, artifactId, version, null, "failed to request Jar file");
        }
    });
}

module.exports = {
    resolveJdkVersion,
    resolveJarJdkVersion,
}