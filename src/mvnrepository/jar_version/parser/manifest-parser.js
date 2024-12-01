/**
 * 从manifest中解析编译jar包时的jdk版本
 *
 * @param manifest
 * @returns {{value: any, key: string}|{}}
 */
function parseBuildJdkVersion(manifest) {

    // 做成map
    const lines = manifest.split('\n');
    const map = new Map();
    for (let line of lines) {
        const split = line.split(":");
        if (split.length === 2) {
            const key = split[0].trim();
            const value = split[1].trim();
            map.set(key, value);
        }
    }

    // 在JAR包的MANIFEST.MF文件中，可以查找以下key来确定编译JAR包时使用的JDK版本：
    // Created-By：这个属性包含了编译JAR包的JDK版本信息。例如，Created-By: 1.8.0_181 (Oracle Corporation)表示JAR包是用JDK 1.8.0_181版本编译的
    // Build-Jdk-Spec：这个属性表示编译JAR包时所使用的JDK规范版本。例如，Build-Jdk-Spec: 1.8表示JAR包是按照JDK 1.8规范编译的
    // Build-Jdk：这个属性可能包含JDK的具体版本信息，例如Build-Jdk: 1.8.0_211表示JAR包使用的是JDK 1.8.0_211版本
    const keys = ['Build-Jdk', 'Built-JDK', 'Build-Jdk-Spec', 'Created-By'];
    for (let key of keys) {
        const value = map.get(key);
        if (value) {
            return {
                key,
                value
            };
        }
    }
    return {};
}

module.exports = {
    parseBuildJdkVersion
}
