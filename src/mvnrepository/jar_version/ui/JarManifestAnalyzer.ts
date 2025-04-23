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
    /**
     * 容器元素ID
     * 
     * @description
     * 用于存放分析结果的DOM元素ID
     * 
     * @type {string}
     */
    private elementId: string;
    
    /**
     * Manifest内容
     * 
     * @description
     * JAR文件的MANIFEST.MF文件内容
     * 
     * @type {string | null}
     */
    private manifest: string | null;
    
    /**
     * JDK标题
     * 
     * @description
     * 从Manifest中提取的JDK信息标题，如"Build-Jdk"
     * 
     * @type {string | null}
     */
    private jdkTitle: string | null;
    
    /**
     * JDK版本
     * 
     * @description
     * 从Manifest中提取的JDK版本值，如"1.8.0_202"
     * 
     * @type {string | null}
     */
    private jdkVersion: string | null;

    /**
     * 构造函数
     * 
     * @description
     * 功能描述：
     * 创建一个新的JAR文件Manifest分析器实例，用于展示JAR包构建环境信息。
     * 
     * 适用场景：
     * - 需要展示和分析JAR文件的MANIFEST.MF内容
     * - 显示JAR包编译环境信息
     * 
     * 边界条件：
     * - 任何参数都可能为null，方法内部会处理这些情况
     * - elementId必须是页面上已存在的元素
     * 
     * @param {string} elementId - 容器元素的ID，分析结果将在此元素内显示
     * @param {string | null} manifest - JAR包的MANIFEST.MF文件内容，可以为null表示不存在
     * @param {string | null} jdkTitle - JDK信息的标题，如"Build-Jdk"，可以为null
     * @param {string | null} jdkVersion - JDK版本值，如"1.8.0_202"，可以为null
     * 
     * @example
     * // 创建分析器实例
     * const analyzer = new JarManifestAnalyzer(
     *   "results-container",
     *   manifestContent,
     *   "Build-Jdk",
     *   "11.0.7"
     * );
     * 
     * // 创建一个处理不存在Manifest的分析器
     * const emptyAnalyzer = new JarManifestAnalyzer(
     *   "results-container",
     *   null,
     *   null,
     *   null
     * );
     */
    constructor(elementId: string, manifest: string | null, jdkTitle: string | null, jdkVersion: string | null) {
        this.elementId = elementId;
        this.manifest = manifest;
        this.jdkTitle = jdkTitle;
        this.jdkVersion = jdkVersion;
    }

    /**
     * 展示 Jar 文件的 Manifest 分析结果
     * 
     * @description
     * 功能描述：
     * 在指定容器中展示JAR文件MANIFEST.MF的分析结果，包括JDK构建信息。
     * 创建可交互的元素，支持鼠标悬停查看完整Manifest内容，点击复制内容。
     * 
     * 适用场景：
     * - 展示JAR包构建信息
     * - 提供完整Manifest内容的查看渠道
     * - 方便用户复制Manifest信息
     * 
     * 边界条件：
     * - 依赖DOM操作，需要在浏览器环境中使用
     * - manifest为null时会显示"meta file not found"提示
     * - jdkTitle或jdkVersion为null时会显示"build information not found"提示
     * - 使用绝对定位创建悬浮提示框
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @example
     * // 创建分析器并展示结果
     * const analyzer = new JarManifestAnalyzer(
     *   "container-id",
     *   "Manifest-Version: 1.0\nBuild-Jdk: 1.8.0_292",
     *   "Build-Jdk",
     *   "1.8.0_292"
     * );
     * await analyzer.showJarManifestAnalyzeResult();
     * 
     * // 处理不存在Manifest的情况
     * const emptyAnalyzer = new JarManifestAnalyzer(
     *   "container-id",
     *   null,
     *   null,
     *   null
     * );
     * await emptyAnalyzer.showJarManifestAnalyzeResult();
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
     * 
     * @description
     * 功能描述：
     * 生成用于存放Manifest分析结果的DOM元素ID。
     * 根据容器元素ID创建唯一的子元素ID。
     * 
     * 适用场景：
     * - 内部使用，生成唯一的DOM元素ID
     * - 确保不同分析结果之间不会ID冲突
     * 
     * 边界条件：
     * - 依赖elementId的唯一性
     * 
     * @param {string} elementId - 容器元素ID
     * 
     * @returns {string} 生成的Manifest元素ID
     * 
     * @private 内部辅助方法，不应由外部直接调用
     */
    private buildManifestId(elementId: string): string {
        return elementId + "-manifest-analyze-result";
    }
}