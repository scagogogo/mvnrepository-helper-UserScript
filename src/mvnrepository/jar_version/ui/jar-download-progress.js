// 跟进度相关的内容展示在这里

/**
 * 展示Jar文件下载的进度，当请求比较大的Jar包时这个就比较有用了
 *
 * @param taskId
 * @returns {(function(*))|*}
 */
async function showRequestJarProgress(taskId) {
    const id = await buildJarDownloadProgressElementId(taskId);
    const showProgressElt = document.createElement('div');
    showProgressElt.id = id;
    document.getElementById(taskId).appendChild(showProgressElt);

    // 进度条
    let progressElt = document.createElement('progress');
    progressElt.id = id;
    progressElt.setAttribute("max", "100");
    progressElt.setAttribute("value", "0");
    progressElt.style = "width: 100%; height: 10px;";
    showProgressElt.appendChild(progressElt);

    // 说明文本
    let progressLabelElt = document.createElement('label');
    progressLabelElt.textContent = 'Jar Downloaded ' + 0 + '%';
    showProgressElt.appendChild(progressLabelElt);

    return function (response) {
        if (response.lengthComputable) {
            const loaded = response.loaded;
            const total = response.total;
            const percentComplete = (loaded / total) * 100;
            progressElt.value = percentComplete;
            progressLabelElt.textContent = 'Jar Downloaded ' + percentComplete.toFixed(2) + `% ( ${loaded} / ${total} Bytes)`;
        } else {
            console.log('Download size is unknown');
        }
    };
}

/**
 * 从界面上删除进度相关信息
 *
 * @param taskId
 * @returns {Promise<void>}
 */
async function removeRequestJarProgress(taskId) {
    const id = await buildJarDownloadProgressElementId(taskId);
    const element = document.getElementById(id);
    if (!element) {
        return;
    }
    element.remove();
}

/**
 *
 * @param taskId
 * @returns {Promise<string>}
 */
async function buildJarDownloadProgressElementId(taskId) {
    return taskId + "-jar-download-progress";
}

module.exports = {
    showRequestJarProgress,
    removeRequestJarProgress,
}