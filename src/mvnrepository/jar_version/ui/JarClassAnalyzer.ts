import ClassFileUtil from "../../../utils/ClassFileUtil";
import ClipboardUtil from "../../../utils/ClipboardUtil";

/**
 * Jar包Class分析结果展示工具类
 *
 * 功能说明：
 * 1. 在指定容器中展示JDK版本分析结果
 * 2. 支持悬停查看详细版本分布
 * 3. 支持点击复制分析数据
 *
 * 使用示例：
 * @example
 * // 在ID为"analysis-container"的元素中展示结果
 * JarClassAnalyzer.show(
 *   "analysis-container",
 *   new Map([[52, 150], [55, 80]]),
 *   55,
 *   0
 * );
 */
export default class JarClassAnalyzer {
    /**
     * 展示Jar包Class分析结果
     *
     * @description
     * 功能描述：
     * 在指定容器中展示JAR包Class文件的版本分析结果，包括最高JDK版本和版本分布。
     * 创建可交互元素，支持鼠标悬停查看详细版本分布，点击复制分析数据。
     * 
     * 适用场景：
     * - 展示JAR包中Class文件的JDK版本信息
     * - 分析JAR包的兼容性和编译环境
     * - 提供版本分布的可视化展示
     * 
     * 边界条件：
     * - 依赖DOM操作，需要在浏览器环境中使用
     * - 如果metric为空，显示"There is no Class file in the Jar package"
     * - 如果maxMajorVersion为0或未定义，显示"analyze failed"
     * - 悬浮提示框使用绝对定位
     * 
     * @param {string} elementId - 父容器元素ID，结果将在此元素内展示
     * @param {Map<number, number>} metric - Class版本分布数据，键为版本号(如52表示Java 8)，值为该版本的文件数量
     * @param {number} maxMajorVersion - 检测到的最高主版本号
     * @param {number} maxMinorVersion - 检测到的最高次版本号
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @example
     * // 示例1: 展示包含Java 8和Java 11文件的JAR分析结果
     * await JarClassAnalyzer.show(
     *   "result-container",
     *   new Map([
     *     [52, 150], // Java 8: 150个文件
     *     [55, 30]   // Java 11: 30个文件
     *   ]),
     *   55, // 最高版本是Java 11
     *   0
     * );
     * 
     * // 示例2: 处理空JAR包
     * await JarClassAnalyzer.show(
     *   "result-container",
     *   new Map(),
     *   0,
     *   0
     * );
     */
    static async show(
        elementId: string,
        metric: Map<number, number>,
        maxMajorVersion: number,
        maxMinorVersion: number
    ): Promise<void> {
        const classId = `${elementId}-jar-class-analyze-result`;
        const container = document.getElementById(elementId);
        if (!container) return;

        let resultElement = document.getElementById(classId);
        if (!resultElement) {
            resultElement = document.createElement("div");
            resultElement.id = classId;
            container.appendChild(resultElement);
        } else {
            resultElement.innerHTML = "";
        }

        // 处理空数据情况
        if (metric.size === 0) {
            resultElement.textContent = "Jar Class: There is no Class file in the Jar package";
            return;
        }

        // 处理分析失败情况
        if (!maxMajorVersion) {
            resultElement.textContent = "Jar Class: analyze failed";
            return;
        }

        // 展示主要版本信息
        const jdkVersion = ClassFileUtil.jdkVersionToHumanReadableString(maxMajorVersion, maxMinorVersion);
        resultElement.textContent = `Jar Class: ${jdkVersion}`;

        // 创建悬浮提示框
        const messages = await this.buildVersionDistribution(metric, 50);
        const tooltip = this.createTooltip(classId, metric, messages);

        // 绑定交互事件
        this.bindInteractions(resultElement, tooltip, messages);
    }

    /**
     * 创建悬浮提示框元素
     * 
     * @description
     * 功能描述：
     * 创建用于显示JAR包Class文件版本分布详情的悬浮提示框DOM元素。
     * 包含标题、版本分布列表等信息。
     * 
     * 适用场景：
     * - 为Class版本分析结果创建详细信息展示框
     * - 作为show方法的辅助实现
     * 
     * 边界条件：
     * - 依赖DOM操作，需要在浏览器环境中使用
     * - 创建的元素会添加到document.body，初始为隐藏状态
     * - 使用CSS样式确保良好的视觉呈现
     * 
     * @param {string} parentId - 父元素ID，用于生成唯一的提示框ID
     * @param {Map<number, number>} metric - Class版本分布数据
     * @param {string[]} messages - 预先格式化的版本分布信息文本数组
     * 
     * @returns {HTMLDivElement} 创建的提示框DOM元素
     * 
     * @private 内部辅助方法，不应由外部直接调用
     */
    private static createTooltip(parentId: string, metric: Map<number, number>, messages: string[]): HTMLDivElement {
        const tooltip = document.createElement("div");
        tooltip.id = `${parentId}-tips`;
        tooltip.style.cssText = `
            display: none;
            position: absolute;
            background: #fff;
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 800px;
            z-index: 1000;
            font-family: system-ui;
        `;
        document.body.appendChild(tooltip);

        // 标题说明
        const total = Array.from(metric).reduce((acc, [key, value]) => acc + value, 0);
        const title = document.createElement("h3");
        title.innerText = `JVM version distribution of Class files in this Jar (Total ${total} class files)`;
        tooltip.appendChild(title);

        // 分布情况
        for (let msg of messages) {
            const percent = document.createElement("li");
            percent.style.cssText = "padding: 4px;";
            percent.textContent = msg;
            tooltip.appendChild(percent);
        }

        return tooltip;
    }

    /**
     * 绑定鼠标交互事件
     * 
     * @description
     * 功能描述：
     * 为分析结果元素绑定鼠标交互事件，包括悬停显示详情和点击复制功能。
     * 通过事件处理控制提示框的显示位置和行为。
     * 
     * 适用场景：
     * - 增强用户界面交互体验
     * - 提供额外信息的访问方式
     * - 实现便捷的数据复制功能
     * 
     * 边界条件：
     * - 依赖DOM事件处理，需要在浏览器环境中使用
     * - 鼠标悬停时提示框会根据元素位置动态定位
     * - 点击操作会调用ClipboardUtil进行数据复制
     * 
     * @param {HTMLElement} element - 要绑定事件的结果元素
     * @param {HTMLDivElement} tooltip - 悬浮提示框元素
     * @param {string[]} messages - 要复制的版本分布信息
     * 
     * @returns {void} 无返回值
     * 
     * @private 内部辅助方法，不应由外部直接调用
     */
    private static bindInteractions(
        element: HTMLElement,
        tooltip: HTMLDivElement,
        messages: string[]
    ): void {
        element.style.cursor = "pointer";
        element.title = "Click to copy analysis data to clipboard";

        // 鼠标悬停逻辑
        element.addEventListener("mouseenter", () => {
            const rect = element.getBoundingClientRect();
            tooltip.style.display = "block";
            tooltip.style.top = `${window.scrollY + rect.top - tooltip.offsetHeight - 8}px`;
            tooltip.style.left = `${window.scrollX + rect.left}px`;
        });

        // 鼠标离开逻辑
        element.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });

        // 点击复制逻辑
        element.addEventListener("click", () => {
            ClipboardUtil.setContent(messages.join("\n"));
            tooltip.style.display = "none";
        });
    }

    /**
     * 构建版本分布数据
     * 
     * @description
     * 功能描述：
     * 将版本分布数据处理为可读的字符串数组，包含百分比和高亮最高版本。
     * 根据文件数量排序，展示占比最多的版本。
     * 
     * 适用场景：
     * - 格式化版本分布数据以便用户阅读
     * - 准备用于展示和复制的文本内容
     * 
     * 边界条件：
     * - 支持处理空的metric，返回空数组
     * - 限制返回的条目数量，防止过多项目导致UI混乱
     * - 文件数量为0时会得到0%的百分比
     * 
     * @param {Map<number, number>} metric - Class版本分布数据，键为版本号，值为该版本的文件数量
     * @param {number} maxItems - 最大返回条目数量，防止数据过多
     * 
     * @returns {Promise<string[]>} 格式化后的版本分布信息字符串数组
     * 
     * @example
     * // 内部使用示例
     * const metric = new Map([
     *   [52, 150], // Java 8: 150个文件
     *   [55, 30]   // Java 11: 30个文件
     * ]);
     * const messages = await JarClassAnalyzer.buildVersionDistribution(metric, 10);
     * // 输出: ["Java 8: 150 files (83.33%)", "Java 11: 30 files (16.67%) 🚀 Highest Version"]
     * 
     * @private 内部辅助方法，通常不应由外部直接调用
     */
    private static async buildVersionDistribution(
        metric: Map<number, number>,
        maxItems: number
    ): Promise<string[]> {
        const sorted = Array.from(metric).sort((a, b) => b[1] - a[1]);
        const total = sorted.reduce((sum, [_, count]) => sum + count, 0);
        const highestVersion = Math.max(...sorted.map(([version]) => version));

        return sorted.slice(0, maxItems).map(([version, count]) => {
            const percentage = ((count / total) * 100).toFixed(2);
            const versionName = ClassFileUtil.jdkVersionToHumanReadableString(version, 0);
            let message = `${versionName}: ${count} files (${percentage}%)`;
            if (version === highestVersion) message += " 🚀 Highest Version";
            return message;
        });
    }

}