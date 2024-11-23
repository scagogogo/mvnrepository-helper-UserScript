/**
 * 构造Jar包的URL
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @returns {string}
 */
function buildJarUrl(groupId, artifactId, version) {
    // TODO
    return `https://repo1.maven.org/maven2/${groupId.replaceAll('.', '/')}/${artifactId}/${version}/${artifactId}-${version}.jar`
}

module.exports = {
    buildJarUrl
}