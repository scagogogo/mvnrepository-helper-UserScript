const {jdkVersionToHumanReadableString} = require("../../../utils/class-util");

/**
 *
 * @param elementId
 * @param metric
 * @param maxMajorVersion
 * @param maxMinorVersion
 * @returns {Promise<void>}
 */
async function showAnalyzeJarClassResult(elementId, metric, maxMajorVersion, maxMinorVersion) {

    // 确保页面有这个元素
    const classId = elementId + "-jar-class-analyze-result";
    let classElt = document.getElementById(classId);
    if (!classElt) {
        classElt = document.createElement("div");
        document.getElementById(elementId).appendChild(classElt);
    } else {
        // 如果已经存在了，则移除所有的孩子元素
        classElt.innerHTML = '';
    }

    // Jar包中没有class文件
    if (metric.size === 0) {
        classElt.textContent = "Jar Class: There is no Class file in the Jar package";
        return;
    }

    // 展示解析到的情况
    if (!maxMajorVersion) {
        classElt.textContent = "Jar Class: analyze failed";
        return;
    }

    // 把结论插入到页面上
    jdkVersion = jdkVersionToHumanReadableString(maxMajorVersion, maxMinorVersion);
    classElt.textContent = `Jar Class: ${jdkVersion}`;

    // 插入一个鼠标移动到这里的悬浮框
    const tips = document.createElement('div');
    tips.id = classId + "-tips";
    tips.style = "display: none; position: absolute; background-color: #fff; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0,0,0,0.2); left: 50%; transform: translateX(-50%); top: 50%; ; z-index: 9999;";
    document.body.appendChild(tips);
    classElt.style.cursor = "pointer;";

    // 标题说明
    const title = document.createElement("h3");
    title.innerText = "JVM version distribution of Class files in this Jar";
    tips.appendChild(title);

    // 分布情况
    const msgs = await buildTopNMetric(metric, 50);
    for(let msg of msgs) {
        const percent = document.createElement("li");
        percent.style = "padding: 4px;";
        percent.textContent = msg;
        tips.appendChild(percent);
    }

    // 鼠标划过与移走
    classElt.onmouseover = function () {

        // 获取元素的边界矩形
        const rect = classElt.getBoundingClientRect();

        // 获取页面的滚动偏移量
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // 计算绝对位置
        const absoluteTop = rect.top + scrollTop;
        const absoluteLeft = rect.left + scrollLeft;

        tips.style.display = 'block';
        tips.style.position = 'absolute';
        tips.style.left = `${absoluteLeft}px`;
        tips.style.top = `${absoluteTop - tips.offsetHeight}px`;
    };
    classElt.onmouseout = function () {
        tips.style.display = 'none';
    };
}

/**
 *
 * @param metric
 * @param n
 * @returns {Promise<*[]>}
 */
async function buildTopNMetric(metric, n) {
    // 将 Map 转换为数组，并按键排序
    const sortedMetric = Array.from(metric).sort((a, b) => b[1] - a[1]);
    const total = Array.from(metric).reduce((acc, [key, value]) => acc + value, 0);

    const msgs = [];
    for (let i = 0; i < n && i < sortedMetric.length; i++) {
        const [version, count] = sortedMetric[i];
        const percent =100.0 * count / total;
        const versionHumanReadable = jdkVersionToHumanReadableString(version);
        const msg = `Class Version ${versionHumanReadable} : ${count} / ${total} ≈ ${percent.toFixed(2)}%`;
        msgs.push(msg);
    }
    return msgs;
}

module.exports = {
    showAnalyzeJarClassResult,
}