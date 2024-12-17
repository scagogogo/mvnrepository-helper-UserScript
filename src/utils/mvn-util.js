/**
 * 构造Jar包的URL
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @returns {string}
 */
function buildJarUrl(groupId, artifactId, version) {
    return `https://repo1.maven.org/maven2` + buildGavJarPath(groupId, artifactId, version);
}

/**
 * 构造GAV的Jar文件的路径
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @returns {string}
 */
function buildGavJarPath(groupId, artifactId, version) {
    return `/${groupId.replaceAll('.', '/')}/${artifactId}/${version}/${artifactId}-${version}.jar`;
}

// TODO 2024-11-24 13:31:47 构造更多的格式

module.exports = {
    buildJarUrl,
    buildGavJarPath
}