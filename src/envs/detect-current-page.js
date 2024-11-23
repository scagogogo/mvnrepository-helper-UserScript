/**
 * 是否在组件版本列表页
 */
function isInComponentVersionListPage() {
    const componentVersionListUrlPattern = new RegExp('^https://mvnrepository.com/artifact/[^/]+/[^/]+$');
    return componentVersionListUrlPattern.test(window.location.href);
}

/**
 * 是否在组件详情页
 */
function isInComponentDetailPage() {
    const componentDetailUrlPattern = new RegExp('^https://mvnrepository.com/artifact/[^/]+/[^/]+/[^/]+$');
    return componentDetailUrlPattern.test(window.location.href);
}

/**
 * 解析URL中的GAV
 *
 * @param url
 * @returns {{groupId: null, artifactId: null, version: null}|{}}
 */
function parseGAV(url) {
    const prefix = 'https://mvnrepository.com/artifact/';
    if (!url.startsWith(prefix)) {
        return {};
    }
    const paths = url.substring(prefix.length, url.length).split('/');
    let groupId = null, artifactId = null, version = null;
    if (paths.length >= 1) {
        groupId = paths[0];
    }
    if (paths.length >= 2) {
        artifactId = paths[1];
    }
    if (paths.length >= 3) {
        version = paths[2];
    }
    return {
        groupId,
        artifactId,
        version
    }
}

module.exports = {
    isInComponentVersionListPage,
    isInComponentDetailPage,
    parseGAV
}