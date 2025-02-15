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
     * @param elementId - 父容器元素ID
     * @param metric - Class版本分布数据（Map<版本号, 数量>）
     * @param maxMajorVersion - 最大主版本号
     * @param maxMinorVersion - 最大次版本号
     *
     * @example
     * // 示例数据格式
     * const metric = new Map([[52, 150], [55, 80]]);
     * JarClassAnalyzer.show("result-container", metric, 55, 0);
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
        const tooltip = this.createTooltip(classId);
        const messages = await this.buildVersionDistribution(metric, 50);

        // 绑定交互事件
        this.bindInteractions(resultElement, tooltip, messages);
    }

    /** 创建悬浮提示框元素 */
    private static createTooltip(parentId: string): HTMLDivElement {
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
            max-width: 400px;
            z-index: 1000;
            font-family: system-ui;
        `;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    /** 绑定鼠标交互事件 */
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

    /** 构建版本分布数据 */
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