const JSZip = require("jszip");
const {buildJarUrl} = require("../../../utils/mvn-util");
const {parseBuildJdkVersion} = require("../parser/manifest-parser");
const {parseClassBuildJdkVersionMetric} = require("../parser/jar-class-parser");
const {showRequestJarProgress, removeRequestJarProgress} = require("../ui/jar-download-progress");
const {showAnalyzeJarClassResult} = require("../ui/jar-class-analyze");
const {showJarManifestAnalyzeResult} = require("../ui/jar-manifest-analyzer");
const {showErrorMsg} = require("../ui/error");
const {
    findGavJarInformation,
    GavJarInformation,
    saveGavJarInformation,
    updateGavJarInformation
} = require("../../../database/gav-jar-information-storage");

/**
 *
 * 解析GAV的Jar包编译信息，并在界面上展示
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param elementId 要把进度及结果展示在哪个元素中
 * @param jarUrl
 * @returns {Promise<void>}
 */
async function resolveJarJdkVersion(groupId, artifactId, version, elementId, jarUrl) {
    // 读取本地缓存，如果命中了的话就直接展示本地缓存的结果
    const jarInformation = await findGavJarInformation(groupId, artifactId, version);
    if (await isJarInformationCacheValid(jarInformation)) {

        // 从缓存中展示manifest信息
        let {key, value} = parseBuildJdkVersion(jarInformation.manifest);
        await showJarManifestAnalyzeResult(elementId, jarInformation.manifest, key, value);

        // 从缓存中展示class信息
        await showAnalyzeJarClassResult(elementId, jarInformation.metric, jarInformation.maxMajorVersion, jarInformation.maxMinorVersion);
    } else {
        // 请求Jar文件
        await requestAndAnalyzeJarFile(groupId, artifactId, version, elementId, jarUrl);
    }
}

/**
 * 判断读取到的缓存信息是否有效
 *
 * @param jarInformation {GavJarInformation}
 * @returns {Promise<boolean>}
 */
async function isJarInformationCacheValid(jarInformation) {
    if (!jarInformation) {
        return false;
    }
    return jarInformation.manifestDetectDone && jarInformation.jarClassDetectDone
}

/**
 * 请求和分析Jar包
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param elementId
 * @param jarUrl
 * @returns {Promise<void>}
 */
async function requestAndAnalyzeJarFile(groupId, artifactId, version, elementId, jarUrl) {
    try {
        if (!jarUrl) {
            jarUrl = buildJarUrl(groupId, artifactId, version);
        }

        // 创建进度更新通道
        const progressChannel = new EventTarget();
        let lastProgress = 0;

        // 包装为Promise
        const response = await new Promise((resolve, reject) => {
            // 进度处理（带节流）
            const handleProgress = (progress) => {
                const now = Date.now();
                if (now - lastProgress > 100) { // 每100ms更新一次
                    showRequestJarProgress(elementId)(progress);
                    lastProgress = now;
                }
            };

            // 请求配置
            GM_xmlhttpRequest({
                method: "GET",
                url: jarUrl,
                responseType: "arraybuffer",
                onload: (response) => {
                    progressChannel.removeEventListener('progress', handleProgress);
                    resolve(response);
                },
                onerror: (error) => {
                    progressChannel.removeEventListener('progress', handleProgress);
                    reject(error);
                },
                onprogress: (progress) => {
                    const event = new CustomEvent('progress', { detail: progress });
                    progressChannel.dispatchEvent(event);
                }
            });

            // 监听进度事件
            progressChannel.addEventListener('progress', handleProgress);
        });

        // 同步执行分析
        await analyzeJarFile(groupId, artifactId, version, elementId)(response);

    } catch (error) {
        showRequestJarFailedMessage(elementId, jarUrl)(error);
        throw error; // 向上传递错误
    }
}

function analyzeJarFile(groupId, artifactId, version, elementId) {
    return async (response) => {
        removeRequestJarProgress(elementId);

        if (response.status === 200) {
            try {
                const jarFile = new JSZip(response.response);

                // 同步执行解析流程
                await analyzeManifest(groupId, artifactId, version, elementId, jarFile);
                await analyzeJar(groupId, artifactId, version, elementId, jarFile);

            } catch (parseError) {
                await showErrorMsg(elementId, `解析JAR文件失败: ${parseError.message}`);
                throw parseError;
            }
        } else {
            await showErrorMsg(elementId, `下载失败 HTTP ${response.status}`);
            throw new Error(`HTTP ${response.status}`);
        }
    };
}

/**
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param elementId
 * @param jarFile
 * @returns {Promise<void>}
 */
async function analyzeJar(groupId, artifactId, version, elementId, jarFile) {
    // 开始分析整个Jar包中的字节码文件的情况
    const {metric, maxMajorVersion, maxMinorVersion} = parseClassBuildJdkVersionMetric(jarFile);
    showAnalyzeJarClassResult(elementId, metric, maxMajorVersion, maxMinorVersion);

    // 也保存到数据库里一份，下次就直接读取这个结果不用再请求Jar文件了
    let jarInformation = await findGavJarInformation(groupId, artifactId, version);
    if (!jarInformation) {
        jarInformation = new GavJarInformation();
        jarInformation.groupId = groupId;
        jarInformation.artifactId = artifactId;
        jarInformation.version = version;
        jarInformation.metric = metric;
        jarInformation.maxMajorVersion = maxMajorVersion;
        jarInformation.maxMinorVersion = maxMinorVersion;
        jarInformation.jarClassDetectDone = true;
        await saveGavJarInformation(jarInformation);
    } else {
        jarInformation.metric = metric;
        jarInformation.maxMajorVersion = maxMajorVersion;
        jarInformation.maxMinorVersion = maxMinorVersion;
        jarInformation.jarClassDetectDone = true;
        await updateGavJarInformation(jarInformation);
    }
}

/**
 *
 * 尝试从manifest中解析编译信息
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param elementId
 * @param jarFile {JSZip}
 * @returns {Promise<void>}
 */
async function analyzeManifest(groupId, artifactId, version, elementId, jarFile) {
    const metaFileName = 'META-INF/MANIFEST.MF';
    let manifest = null;
    if (jarFile.files[metaFileName]) {
        manifest = jarFile.files[metaFileName].asText();
        let {key, value} = parseBuildJdkVersion(manifest);
        showJarManifestAnalyzeResult(elementId, manifest, key, value);
    } else {
        showJarManifestAnalyzeResult(elementId, null, null, null);
    }

    // 也保存到数据库里一份，下次就直接读取这个结果不用再请求Jar文件了
    let jarInformation = await findGavJarInformation(groupId, artifactId, version);
    if (!jarInformation) {
        jarInformation = new GavJarInformation();
        jarInformation.groupId = groupId;
        jarInformation.artifactId = artifactId;
        jarInformation.version = version;
        jarInformation.manifestDetectDone = true;
        jarInformation.manifest = manifest;
        await saveGavJarInformation(jarInformation);
    } else {
        jarInformation.manifestDetectDone = true;
        jarInformation.manifest = manifest;
        await updateGavJarInformation(jarInformation);
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

module.exports = {
    resolveJarJdkVersion,
}