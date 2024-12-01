/**
 * 需要在HTTPS环境下运行，或者在本地开发时localhost
 *
 * @param text
 * @returns {Promise<void>}
 */
async function setClipboardContent(text) {
    if ('clipboard' in navigator) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('剪切板内容已更新为： ' + text);
        } catch (err) {
            console.error('无法使用剪切板写入功能: ', err);
        }
    } else {
        console.log('Clipboard API 不可用');
    }
}

module.exports = {
    setClipboardContent,
}