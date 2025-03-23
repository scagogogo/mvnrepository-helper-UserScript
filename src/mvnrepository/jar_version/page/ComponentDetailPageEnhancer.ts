import IdUtil from "../../../utils/IdUtil";
import JarJdkVersionDetector from "../detector/JarJdkVersionDetector";
import ErrorHandler from "../ui/ErrorHandler";
import {GAVInfo, PageDetector} from "../../../envs/PageDetector";
import {logger} from "../../../logger/Logger";

declare const $: any; // 为 jQuery 提供类型声明

export default class ComponentDetailPageEnhancer {
    /**
     * 初始化组件详情页增强功能
     */
    static async initComponentDetailPageJarJdkVersion() {
        if (!PageDetector.isInComponentDetailPage()) return;
        await this.addComponentDetailPageJarJdkVersion();
        logger.debug("组件详情页，已经初始化Jar包编译JDK版本识别功能");
    }

    /**
     * 在组件详情页表格中添加一行展示 Jar 包的 JDK 编译信息
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
     * @returns 解析后的 Jar 包 URL 或 null
     */
    private static parseJarUrl(): string | null {
        return $('a:contains("jar"):first').attr("href");
    }
}