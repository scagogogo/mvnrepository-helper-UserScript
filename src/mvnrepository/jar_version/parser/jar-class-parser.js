const {parseClassFileVersion, isClassFileName, isClassFileBytes} = require("../../../utils/class-util");

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

        console.log(filename + " " + majorVersion);
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
