import $ from "jquery";
import IdUtil from "../../../utils/IdUtil";
import {PageDetector} from "../../../envs/PageDetector";
import JarJdkVersionDetector from "../detector/JarJdkVersionDetector";
import MavenUtil from "../../../utils/MavenUtil";
import {RepoInformation, RepoInformationStorage} from "../../../database/RepoInformationStorage";
import PromiseThreadPool from "./PromiseThreadPool";
import Settings from "../../../database/Settings";
import {logger} from "../../../logger/Logger";
import JarDownloadProgress from "../ui/JarDownloadProgress";

/**
 * 组件版本列表页面增强处理器
 *
 * 功能说明：
 * 1. 在版本列表表格中新增"Build JDK Version"列
 * 2. 异步解析并显示每个版本对应的JDK版本
 * 3. 支持仓库信息缓存和并发控制
 *
 * 使用示例：
 * @example
 * ComponentVersionListEnhancer.init();
 */
export default class ComponentVersionListEnhancer {
    /** 表格列头标题 */
    private static readonly COLUMN_TITLE = "Build JDK Version";
    /** 最大并发请求数（默认值） */
    private static readonly DEFAULT_CONCURRENCY = 5;

    /**
     * 初始化版本列表页面增强功能
     */
    static initComponentVersionListPageJarJdkVersion(): void {
        if (!PageDetector.isInComponentVersionListPage()) return;
        this.addVersionColumn();
    }

    /**
     * 添加版本信息列到表格
     */
    private static addVersionColumn(): void {
        const table = $('.gridcontainer table.versions');
        this.addTableHeader(table);
        this.populateTableData(table);
    }

    /**
     * 添加表头列
     * @param table - 目标表格jQuery对象
     */
    private static addTableHeader(table: JQuery<HTMLElement>): void {
        const th = document.createElement('th');
        th.innerHTML = `
            <span style="width: 12em">${this.COLUMN_TITLE}</span>
            <a style="margin-left: 5px; border-radius: 50%; border: 2px solid black; width: 20px; display: inline-block; text-align: center; cursor: pointer;"
               href="https://github.com/scagogogo/mvnrepository-helper-UserScript"
               target="_blank">?</a>
        `;
        table.find('thead tr th:contains("Version")').after(th);
    }

    /**
     * 填充表格数据
     * @param table - 目标表格jQuery对象
     */
    private static async populateTableData(table: JQuery<HTMLElement>): Promise<void> {
        const {groupId, artifactId} = this.parseGAV();
        if (!groupId || !artifactId) return;

        const settings = await Settings.findSettings() ?? new Settings();
        const threadNum = settings.concurrency || this.DEFAULT_CONCURRENCY;
        logger.debug(`线程池并发：${threadNum}`);
        const threadPool = new PromiseThreadPool(threadNum);

        table.find('tbody tr td').each((index, element) => {
            const versionLink = $(element).find('.vbtn');
            if (versionLink.length !== 1) return;

            const version = versionLink.text().trim();
            const repoPath = $(element).next().next().find("a").attr("href");
            const cellId = IdUtil.randomId();

            $(element).after(`<td id="${cellId}"><div class="loading-spinner"></div></td>`);

            threadPool.submit(() =>
                this.processVersion(
                    groupId,
                    artifactId,
                    version,
                    cellId,
                    repoPath ?? ""
                )
            );
        });
    }

    /**
     * 处理单个版本信息
     * @param groupId - Maven Group ID
     * @param artifactId - Maven Artifact ID
     * @param version - 组件版本号
     * @param cellId - 表格单元格ID
     * @param repoPath - 仓库详情页路径
     */
    private static async processVersion(
        groupId: string,
        artifactId: string,
        version: string,
        cellId: string,
        repoPath: string
    ): Promise<void> {
        try {
            const repoInfo = await RepoInformationStorage.find(repoPath) ?? await this.fetchRepoInfo(repoPath);
            const jarUrl = `${repoInfo.baseUrl}${MavenUtil.buildGavJarPath(groupId, artifactId, version)}`;

            await JarJdkVersionDetector.resolveJarJdkVersion(groupId, artifactId, version, cellId, jarUrl);
        } catch (error) {
            this.handleError(cellId, error as Error);
            throw error;
        }
    }

    /**
     * 获取仓库信息
     * @param repoPath - 仓库路径
     */
    private static async fetchRepoInfo(repoPath: string): Promise<RepoInformation> {
        const data = await $.get(repoPath);
        const baseUrl = $(data).find(".im-subtitle").text().trim();

        const repoInfo = new RepoInformation(repoPath, baseUrl);
        await RepoInformationStorage.save(repoInfo);
        return repoInfo;
    }

    /**
     * 解析页面中的GroupId和ArtifactId
     */
    private static parseGAV(): { groupId: string | null; artifactId: string | null } {
        const parts = $('.breadcrumb').text().split(' » ').map(s => s.trim());
        return {
            groupId: parts[1] ?? null,
            artifactId: parts[2] ?? null
        };
    }

    /**
     * 错误处理
     * @param cellId - 单元格ID
     * @param error - 错误对象
     */
    private static handleError(cellId: string, error: Error): void {
        $(`#${cellId}`).html(`
            <span style="color: #dc3545">Error</span>
            <div style="font-size: 0.8em; color: #6c757d">${error.message}</div>
        `);
        logger.error(`[${cellId}] 处理失败:`, error);
    }

}