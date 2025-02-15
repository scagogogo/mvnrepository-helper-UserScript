import ClipboardUtil from "../../../utils/ClipboardUtil";

/**
 * 展示 Jar 文件的 Manifest 分析结果
 *
 * 示例用法：
 * ```typescript
 * showJarManifestAnalyzeResult("container", manifestContent, "JDK Title", "11.0.1");
 * ```
 *
 * @param elementId 容器元素的 ID
 * @param manifest Manifest 内容
 * @param jdkTitle JDK 标题
 * @param jdkVersion JDK 版本
 * @returns {Promise<void>}
 */
export default class JarManifestAnalyzer {
    private elementId: string;
    private manifest: string | null;
    private jdkTitle: string | null;
    private jdkVersion: string | null;

    /**
     * 构造函数
     * @param elementId 容器元素的 ID
     * @param manifest Manifest 内容
     * @param jdkTitle JDK 标题
     * @param jdkVersion JDK 版本
     */
    constructor(elementId: string, manifest: string | null, jdkTitle: string | null, jdkVersion: string | null) {
        this.elementId = elementId;
        this.manifest = manifest;
        this.jdkTitle = jdkTitle;
        this.jdkVersion = jdkVersion;
    }

    /**
     * 展示 Jar 文件的 Manifest 分析结果
     * @returns {Promise<void>}
     */
    public async showJarManifestAnalyzeResult(): Promise<void> {
        const manifestId = this.buildManifestId(this.elementId);
        let manifestElt = document.getElementById(manifestId);

        if (!manifestElt) {
            manifestElt = document.createElement("div");
            const containerElement = document.getElementById(this.elementId);
            if (containerElement) {
                containerElement.appendChild(manifestElt);
            }
        }

        // META-INF/MANIFEST.MF 文件可能不存在
        if (!this.manifest) {
            manifestElt!.textContent = "META-INF/MANIFEST.MF: meta file not found";
            return;
        }

        if (!this.jdkTitle || !this.jdkVersion) {
            // MANIFEST 存在，但是并没有说编译的 JDK 版本
            manifestElt!.textContent = "META-INF/MANIFEST.MF: build information not found";
        } else {
            // 最后才是展示出来
            manifestElt!.textContent = `META-INF/MANIFEST.MF: ${this.jdkTitle}:${this.jdkVersion}`;
        }

        // 插入一个鼠标移动到这里的悬浮框
        const tips = document.createElement('pre');
        tips.id = manifestId + "-tips";
        tips.style.display = "none";
        tips.style.position = "absolute";
        tips.style.backgroundColor = "#fff";
        tips.style.border = "1px solid #ccc";
        tips.style.padding = "10px";
        tips.style.borderRadius = "5px";
        tips.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.2)";
        tips.style.left = "50%";
        tips.style.transform = "translateX(-50%)";
        tips.style.top = "50%";
        tips.style.zIndex = "9999";
        tips.textContent = this.manifest!;
        document.body.appendChild(tips);
        manifestElt!.style.cursor = "pointer";

        // 鼠标划过与移走
        manifestElt!.onmouseover = () => {
            // 获取元素的边界矩形
            const rect = manifestElt!.getBoundingClientRect();

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
        manifestElt!.onmouseout = () => {
            tips.style.display = 'none';
        };

        // 鼠标单击的时候复制到剪切板
        manifestElt!.title = "Click with the left mouse button to copy the pop-up window contents to the clipboard";
        manifestElt!.onclick = () => {
            ClipboardUtil.setContent(this.manifest!);
        };
    }

    /**
     * 构建 Manifest 元素的 ID
     * @param elementId 容器元素的 ID
     * @returns 唯一的 Manifest 元素 ID
     */
    private buildManifestId(elementId: string): string {
        return elementId + "-manifest-analyze-result";
    }
}