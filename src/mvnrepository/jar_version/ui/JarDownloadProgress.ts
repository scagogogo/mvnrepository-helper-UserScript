/**
 * 展示Jar文件下载的进度，当请求比较大的Jar包时这个就比较有用了
 *
 * 示例用法：
 * ```typescript
 * const progressHandler = new JarDownloadProgress("task-123");
 * progressHandler.showProgress(response); // response 是一个包含下载进度的对象
 * progressHandler.removeProgress();
 * ```
 */
import {logger} from "../../../logger/Logger";

export default class JarDownloadProgress {
    /**
     * 任务ID
     * 
     * @description
     * 用于唯一标识一个下载任务，也用于构建进度条元素ID
     * 
     * @type {string}
     */
    private taskId: string;
    
    /**
     * 进度条元素
     * 
     * @description
     * 对进度条HTML元素的引用，用于更新进度
     * 
     * @type {HTMLProgressElement | null}
     */
    private progressElt: HTMLProgressElement | null = null;
    
    /**
     * 进度标签元素
     * 
     * @description
     * 对进度文本标签HTML元素的引用，用于显示百分比和已下载/总大小信息
     * 
     * @type {HTMLLabelElement | null}
     */
    private progressLabelElt: HTMLLabelElement | null = null;

    /**
     * 构造函数
     * 
     * @description
     * 功能描述：
     * 创建一个新的JAR包下载进度处理器实例，用于展示特定任务的下载进度。
     * 不会立即创建UI元素，而是在首次调用showProgress时才创建。
     * 
     * 适用场景：
     * - 需要为用户展示JAR包下载进度的场景
     * - 大文件下载时提供视觉反馈
     * 
     * 边界条件：
     * - 依赖DOM操作，需要在浏览器环境中使用
     * - taskId必须对应页面上已存在的元素ID
     * 
     * @param {string} taskId - 任务ID，用于生成唯一的进度条元素ID
     *                          进度条将作为此ID元素的子元素
     * 
     * @example
     * // 创建进度处理器实例
     * const progressHandler = new JarDownloadProgress("download-container");
     */
    constructor(taskId: string) {
        this.taskId = taskId;
    }

    /**
     * 展示下载进度
     * 
     * @description
     * 功能描述：
     * 在指定容器中创建或更新JAR包下载进度条，显示当前下载进度百分比和已下载/总大小。
     * 首次调用时会创建进度条元素，后续调用会更新进度。
     * 
     * 适用场景：
     * - 在XMLHttpRequest的onprogress回调中调用
     * - 需要实时展示下载进度的场景
     * 
     * 边界条件：
     * - 依赖DOM操作，需要在浏览器环境中使用
     * - 如果lengthComputable为false，则无法准确显示进度
     * - 节流控制：建议使用节流限制更新频率，避免频繁DOM操作
     * 
     * @param {Object} response - 下载响应对象，包含如下属性：
     *   - loaded: number - 已加载的字节数
     *   - total: number - 总字节数
     *   - lengthComputable: boolean - 是否可计算总长度
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 在XHR的progress事件中使用
     * GM_xmlhttpRequest({
     *   url: 'https://repo1.maven.org/maven2/org/example/lib/1.0/lib-1.0.jar',
     *   method: 'GET',
     *   responseType: 'arraybuffer',
     *   onprogress: (progress) => {
     *     progressHandler.showProgress(progress);
     *   },
     *   onload: (response) => {
     *     progressHandler.removeProgress();
     *     // 处理下载完成的JAR
     *   }
     * });
     */
    public showProgress(response: { loaded: number; total: number; lengthComputable: boolean }): void {
        const id = this.buildJarDownloadProgressElementId(this.taskId);

        // 检查进度条容器是否存在
        if (!document.getElementById(id)) {
            // 创建进度条容器
            const showProgressElt = document.createElement('div');
            showProgressElt.id = id;
            const taskIdElement = document.getElementById(this.taskId);
            if (taskIdElement) {
                taskIdElement.appendChild(showProgressElt);
            }

            // 创建进度条
            this.progressElt = document.createElement('progress');
            this.progressElt.setAttribute("max", "100");
            this.progressElt.setAttribute("value", "0");
            this.progressElt.style.width = "100%";
            this.progressElt.style.height = "10px";
            showProgressElt.appendChild(this.progressElt);

            // 创建说明文本
            this.progressLabelElt = document.createElement('label');
            this.progressLabelElt.textContent = 'Jar Downloaded ' + 0 + '%';
            showProgressElt.appendChild(this.progressLabelElt);
        }

        // 更新进度
        if (response.lengthComputable) {
            const loaded = response.loaded;
            const total = response.total;
            const percentComplete = (loaded / total) * 100;

            if (this.progressElt) {
                this.progressElt.value = percentComplete;
            }

            if (this.progressLabelElt) {
                this.progressLabelElt.textContent = `Jar Downloaded ${percentComplete.toFixed(2)}% (${loaded} / ${total} Bytes)`;
            }
        } else {
            logger.debug('Download size is unknown');
        }
    }

    /**
     * 从界面上删除进度相关信息
     * 
     * @description
     * 功能描述：
     * 从DOM中移除下载进度条元素，通常在下载完成或失败后调用。
     * 
     * 适用场景：
     * - 下载完成时清理界面
     * - 下载失败需要移除进度显示时
     * - 用户取消下载操作时
     * 
     * 边界条件：
     * - 如果进度条元素不存在，此方法不会有任何效果
     * - 调用后progressElt和progressLabelElt引用将失效，但不会被置为null
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 下载完成后移除进度条
     * GM_xmlhttpRequest({
     *   // ...配置
     *   onload: () => {
     *     progressHandler.removeProgress();
     *     console.log('下载完成，进度条已移除');
     *   },
     *   onerror: () => {
     *     progressHandler.removeProgress();
     *     console.error('下载失败，进度条已移除');
     *   }
     * });
     */
    public removeProgress(): void {
        const id = this.buildJarDownloadProgressElementId(this.taskId);
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    /**
     * 构建进度条元素的ID
     * 
     * @description
     * 功能描述：
     * 根据任务ID生成唯一的进度条容器元素ID。
     * 
     * 适用场景：
     * - 内部使用，确保进度条元素ID唯一
     * - 创建和查找进度条元素时使用
     * 
     * 边界条件：
     * - 依赖taskId的唯一性
     * 
     * @param {string} taskId - 任务ID，用于构建唯一的进度条元素ID
     * 
     * @returns {string} 生成的进度条元素ID
     * 
     * @private 内部辅助方法，不应由外部直接调用
     */
    private buildJarDownloadProgressElementId(taskId: string): string {
        return taskId + "-jar-download-progress";
    }
}