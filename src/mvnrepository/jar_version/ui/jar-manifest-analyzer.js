/**
 *
 * @param elementId
 * @param manifest
 * @param jdkTitle
 * @param jdkVersion
 * @returns {Promise<void>}
 */
async function showJarManifestAnalyzeResult(elementId, manifest, jdkTitle, jdkVersion) {
    const manifestId = elementId + "-manifest-analyze-result";
    let manifestElt = document.getElementById(manifestId);
    if (!manifestElt) {
        manifestElt = document.createElement("div");
        document.getElementById(elementId).appendChild(manifestElt);
    }

    // META-INF/MANIFEST.MF 文件可能不存在
    if (!manifest) {
        manifestElt.textContent = "META-INF/MANIFEST.MF: file not found";
        return;
    }


    if (!jdkTitle || !jdkVersion) {
        // MANIFEST存在，但是并没有说编译的JDK版本
        manifestElt.textContent = "META-INF/MANIFEST.MF: build information not found"
    } else {
        // 最后才是展示出来
        manifestElt.textContent = `META-INF/MANIFEST.MF: ${jdkTitle}:${jdkVersion}`;
    }

    // 插入一个鼠标移动到这里的悬浮框
    const tips = document.createElement('pre');
    tips.id = manifestId + "-tips";
    tips.style = "display: none; position: absolute; background-color: #fff; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0,0,0,0.2); left: 50%; transform: translateX(-50%); top: 50%; z-index: 9999;";
    tips.textContent = manifest;
    document.body.appendChild(tips);
    manifestElt.style.cursor = "pointer;";

    // 鼠标划过与移走
    manifestElt.onmouseover = function () {

        // 获取元素的边界矩形
        const rect = manifestElt.getBoundingClientRect();

        // 获取页面的滚动偏移量
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // 计算绝对位置
        const absoluteTop = rect.top + scrollTop;
        const absoluteLeft = rect.left + scrollLeft;

        tips.style.display = 'block';
        tips.style.position = 'absolute';
        tips.style.left = `${absoluteLeft}px`;
        tips.style.top = `${absoluteTop - tips.offsetHeight - 20}px`;
    };
    manifestElt.onmouseout = function () {
        tips.style.display = 'none';
    };
}

module.exports = {
    showJarManifestAnalyzeResult,
}
