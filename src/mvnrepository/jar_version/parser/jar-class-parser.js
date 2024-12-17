const {parseClassFileVersion, isClassFileName, isClassFileBytes} = require("../../../utils/class-util");

function initJarBlackFileName() {
    const set = new Set();

    // 有一些Jar包明明是1.8版本的，但是会内置一个模块信息，而这个模块信息是可以被忽略的，比如：
    // https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind/2.18.2
    set.add("META-INF/versions/9/module-info.class");

    return set;
}

const BLACK_FILENAME = initJarBlackFileName();

/**
 * 统计JDK中所有的class文件编译分布情况
 *
 * @param jarFile
 * @returns {{metric: Map<any, any>, maxMajorVersion: number, maxMinorVersion: number}}
 */
function parseClassBuildJdkVersionMetric(jarFile) {

    const metric = new Map();
    let maxMajorVersion = 0;
    let maxMinorVersion = 0;
    for (let filename of Object.keys(jarFile.files)) {

        // 黑名单中的文件不参与统计
        if (BLACK_FILENAME.has(filename)) {
            continue;
        }

        const jarEntry = jarFile.files[filename];
        if (!isClassFileName(filename)) {
            continue;
        }

        const classBytes = jarEntry.asUint8Array();
        // if (!isClassFileBytes(classBytes)) {
        //     continue;
        // }

        const {majorVersion, minorVersion} = parseClassFileVersion(classBytes);
        if (majorVersion > maxMajorVersion) {
            maxMajorVersion = majorVersion;
            maxMinorVersion = minorVersion
        }
        const count = metric.get(majorVersion) || 0;
        metric.set(majorVersion, count + 1);

        // console.log(filename + " " + majorVersion);
    }
    return {
        metric,
        maxMajorVersion,
        maxMinorVersion
    }
}

module.exports = {
    parseClassBuildJdkVersionMetric
}
