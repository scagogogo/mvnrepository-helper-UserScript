/**
 * 从URL中解析出来基础的URL
 *
 * @param url
 * @returns {string}
 */
function parseBaseUrl(url) {
    const parsedUrl = new URL(url);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
}

module.exports = {
    parseBaseUrl
}