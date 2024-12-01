

// TODO 2024-11-24 01:42:42

/**
 * 展示某个任务的出错信息
 *
 * @param taskId
 * @param errorMsg
 * @returns {Promise<void>}
 */
async function showErrorMsg(taskId, errorMsg){
    const errorEltId = taskId + "-error-msg";
    let errorElt = document.getElementById(errorEltId);
    if (!errorElt) {
        errorElt = document.createElement("div");
        errorElt.id = errorEltId;
        const element = document.getElementById(taskId);
        if (!element) {
            return;
        }
        element.appendChild(errorElt);
    }
    errorElt.textContent = errorMsg;
}

module.exports = {
    showErrorMsg
}

