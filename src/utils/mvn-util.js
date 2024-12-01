/**
 * 构造Jar包的URL
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @returns {string}
 */
function buildJarUrl(groupId, artifactId, version) {
    return `https://repo1.maven.org/maven2/${groupId.replaceAll('.', '/')}/${artifactId}/${version}/${artifactId}-${version}.jar`
}

// TODO 2024-11-24 13:31:47 构造更多的格式

module.exports = {
    buildJarUrl
}