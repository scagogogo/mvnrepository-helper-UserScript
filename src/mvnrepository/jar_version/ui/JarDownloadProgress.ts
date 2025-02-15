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

export default class JarDownloadProgress {

    private taskId: string;
    private progressElt: HTMLProgressElement | null = null;
    private progressLabelElt: HTMLLabelElement | null = null;

    /**
     * 构造函数
     * @param taskId 任务ID，用于生成唯一的进度条ID
     */
    constructor(taskId: string) {
        this.taskId = taskId;
    }

    /**
     * 展示下载进度
     * @param response 下载响应对象，包含进度信息
     */
    public showProgress(response: { loaded: number; total: number; lengthComputable: boolean }): void {
        const id = this.buildJarDownloadProgressElementId(this.taskId);

        // 创建进度条容器
        const showProgressElt = document.createElement('div');
        showProgressElt.id = id;
        const taskIdElement = document.getElementById(this.taskId);
        if (taskIdElement) {
            taskIdElement.appendChild(showProgressElt);
        }

        // 创建进度条
        this.progressElt = document.createElement('progress');
        this.progressElt.id = id;
        this.progressElt.setAttribute("max", "100");
        this.progressElt.setAttribute("value", "0");
        this.progressElt.style.width = "100%";
        this.progressElt.style.height = "10px";
        showProgressElt.appendChild(this.progressElt);

        // 创建说明文本
        this.progressLabelElt = document.createElement('label');
        this.progressLabelElt.textContent = 'Jar Downloaded ' + 0 + '%';
        showProgressElt.appendChild(this.progressLabelElt);

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
            console.log('Download size is unknown');
        }
    }

    /**
     * 从界面上删除进度相关信息
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
     * @param taskId 任务ID
     * @returns 唯一的进度条ID
     */
    private buildJarDownloadProgressElementId(taskId: string): string {
        return taskId + "-jar-download-progress";
    }

}