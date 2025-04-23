import IdUtil from "../../../utils/IdUtil";
import JarJdkVersionDetector from "../detector/JarJdkVersionDetector";
import ErrorHandler from "../ui/ErrorHandler";
import {GAVInfo, PageDetector} from "../../../envs/PageDetector";
import {logger} from "../../../logger/Logger";

declare const $: any; // 为 jQuery 提供类型声明

export default class ComponentDetailPageEnhancer {
    /**
     * 初始化组件详情页增强功能
     * 
     * @description
     * 功能描述：
     * 检测当前页面是否为组件详情页，如果是则添加JAR包JDK版本检测功能。
     * 通过判断页面类型，避免在非相关页面执行增强。
     * 
     * 适用场景：
     * - 用户访问Maven构件详情页时
     * - 页面加载或URL变化时调用
     * - 作为用户脚本的入口点
     * 
     * 边界条件：
     * - 依赖PageDetector正确识别页面类型
     * - 需要等待DOM完全加载
     * - 异步操作，等待所有功能初始化完成
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @example
     * // 在页面加载完成后调用
     * document.addEventListener('DOMContentLoaded', async () => {
     *   await ComponentDetailPageEnhancer.initComponentDetailPageJarJdkVersion();
     * });
     * 
     * // 或在URL变化时调用
     * addUrlChangeListener(async () => {
     *   await ComponentDetailPageEnhancer.initComponentDetailPageJarJdkVersion();
     * });
     */
    static async initComponentDetailPageJarJdkVersion() {
        if (!PageDetector.isInComponentDetailPage()) return;
        await this.addComponentDetailPageJarJdkVersion();
        logger.debug("组件详情页，已经初始化Jar包编译JDK版本识别功能");
    }

    /**
     * 在组件详情页表格中添加一行展示 Jar 包的 JDK 编译信息
     * 
     * @description
     * 功能描述：
     * 向组件详情页的信息表格中添加一行，用于显示JAR包的JDK编译版本信息。
     * 创建必要的DOM元素，获取JAR包URL，并调用JarJdkVersionDetector解析并展示版本信息。
     * 
     * 适用场景：
     * - 组件详情页增强
     * - 用户需要了解JAR包的编译环境
     * - 帮助分析JAR包兼容性
     * 
     * 边界条件：
     * - 依赖页面中存在特定的DOM结构(.content table.grid tbody)
     * - 如果无法找到JAR文件URL，将显示错误信息
     * - 依赖PageDetector正确解析GAV信息
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 如果解析或下载过程中出错，可能会抛出异常
     * 
     * @example
     * // 内部调用示例，通常由initComponentDetailPageJarJdkVersion触发
     * async function enhancePage() {
     *   if (isDetailPage()) {
     *     await ComponentDetailPageEnhancer.addComponentDetailPageJarJdkVersion();
     *   }
     * }
     * 
     * @private 通常由initComponentDetailPageJarJdkVersion调用，不建议直接使用
     */
    static async addComponentDetailPageJarJdkVersion() {
        const tbodyElt: HTMLElement | null = document.querySelector(".content table.grid tbody");
        if (!tbodyElt) return;

        // 创建新行
        const lineElt: HTMLTableRowElement = document.createElement("tr");
        tbodyElt.appendChild(lineElt);

        // 创建标题列
        const jdkVersionNameColumnElt: HTMLTableCellElement = document.createElement("th");
        const columnTitleElt: HTMLSpanElement = document.createElement("span");
        columnTitleElt.style.width = "12em";
        columnTitleElt.textContent = "Build JDK Version";
        jdkVersionNameColumnElt.appendChild(columnTitleElt);

        // 添加问号提示链接
        let documentTips: HTMLAnchorElement = document.createElement("a");
        documentTips.textContent = "?";
        documentTips.style.marginLeft = "5px";
        documentTips.style.borderRadius = "50%";
        documentTips.style.border = "2px solid black";
        documentTips.style.width = "20px";
        documentTips.style.display = "inline-block";
        documentTips.style.textAlign = "center";
        documentTips.style.cursor = "pointer";
        documentTips.href = "https://github.com/scagogogo/mvnrepository-helper-UserScript"; // 修正URL
        documentTips.target = "_blank";
        jdkVersionNameColumnElt.appendChild(documentTips);
        lineElt.appendChild(jdkVersionNameColumnElt);

        // 创建值列
        const jdkVersionValueColumnElt: HTMLTableCellElement = document.createElement("td");
        const id: string = IdUtil.randomId();
        jdkVersionValueColumnElt.id = id;
        lineElt.appendChild(jdkVersionValueColumnElt);

        // 解析 Jar 包的 URL
        const jarUrl: string | null = this.parseJarUrl();
        if (!jarUrl) {
            await ErrorHandler.show(id, "not found jar file");
            return;
        }

        // 解析当前页面的组件版本对应的 GAV
        const gavInfo: GAVInfo | null = PageDetector.parseGAV(window.location.href);
        if (gavInfo) {
            logger.debug(`解析到GAV信息：${JSON.stringify(gavInfo)}，开始下载Jar包解析信息...`);
            await JarJdkVersionDetector.resolveJarJdkVersion(gavInfo.groupId, gavInfo.artifactId, gavInfo.version, id, jarUrl);
        }
    }

    /**
     * 解析 Jar 包的 URL
     * 
     * @description
     * 功能描述：
     * 从当前页面中查找JAR文件下载链接的URL，通过jQuery查找包含"jar"文本的链接。
     * 
     * 适用场景：
     * - 从Maven组件详情页获取JAR下载链接
     * 
     * 边界条件：
     * - 依赖jQuery
     * - 依赖页面中存在包含"jar"文本的链接
     * - 如果找不到符合条件的链接，返回null
     * 
     * @returns {string | null} JAR包的下载URL，如果未找到则返回null
     * 
     * @example
     * // 获取JAR文件URL
     * const jarUrl = ComponentDetailPageEnhancer.parseJarUrl();
     * if (jarUrl) {
     *   console.log(`找到JAR下载链接: ${jarUrl}`);
     * } else {
     *   console.log('未找到JAR下载链接');
     * }
     * 
     * @private 内部辅助方法，不建议外部直接调用
     */
    private static parseJarUrl(): string | null {
        return $('a:contains("jar"):first').attr("href");
    }
}