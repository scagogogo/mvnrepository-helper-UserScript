import $ from "jquery";
import IdUtil from "../../../utils/IdUtil";
import {PageDetector} from "../../../envs/PageDetector";
import JarJdkVersionDetector from "../detector/JarJdkVersionDetector";
import MavenUtil from "../../../utils/MavenUtil";
import {RepoInformation, RepoInformationStorage} from "../../../database/RepoInformationStorage";
import PromiseThreadPool from "./PromiseThreadPool";
import Settings from "../../../database/Settings";
import {logger} from "../../../logger/Logger";

/**
 * 组件版本列表页面增强处理器
 *
 * 功能说明：
 * 1. 在版本列表表格中新增"Build JDK Version"列
 * 2. 异步解析并显示每个版本对应的JDK版本
 * 3. 支持仓库信息缓存和并发控制
 *
 * 适用场景：
 * - Maven构件版本列表页面的增强展示
 * - 批量获取多个版本JAR包的编译JDK信息
 * - 需要了解不同版本构件兼容性差异的场景
 * 
 * 边界条件：
 * - 只在匹配的Maven版本列表页面生效
 * - 依赖网络请求下载JAR包进行分析
 * - 使用线程池控制并发请求数，避免请求过多
 * - 支持缓存仓库信息，减少重复请求
 *
 * 使用示例：
 * @example
 * // 在页面加载完成后初始化版本列表增强
 * document.addEventListener('DOMContentLoaded', () => {
 *   ComponentVersionListEnhancer.initComponentVersionListPageJarJdkVersion();
 * });
 */
export default class ComponentVersionListEnhancer {
    /** 
     * 表格列头标题 
     * 
     * @description
     * 版本列表新增列的标题文本
     * 
     * @type {string}
     */
    private static readonly COLUMN_TITLE = "Build JDK Version";
    
    /** 
     * 最大并发请求数（默认值）
     * 
     * @description
     * 当用户未设置并发数时使用的默认并发限制
     * 
     * @type {number} 
     */
    private static readonly DEFAULT_CONCURRENCY = 5;

    /**
     * 初始化版本列表页面增强功能
     * 
     * @description
     * 功能描述：
     * 检测当前页面是否为组件版本列表页，如果是则添加JDK版本信息列。
     * 通过判断页面类型，避免在非相关页面执行增强。
     * 
     * 适用场景：
     * - 用户访问Maven构件版本列表页时
     * - 页面加载或URL变化时调用
     * - 作为用户脚本的入口点
     * 
     * 边界条件：
     * - 依赖PageDetector正确识别页面类型
     * - 需要等待DOM完全加载
     * - 无需等待异步操作完成，各版本信息会异步加载
     * 
     * @returns {void} 无返回值
     * 
     * @example
     * // 在页面加载完成后调用
     * document.addEventListener('DOMContentLoaded', () => {
     *   ComponentVersionListEnhancer.initComponentVersionListPageJarJdkVersion();
     * });
     * 
     * // 或在URL变化时调用
     * addUrlChangeListener(() => {
     *   ComponentVersionListEnhancer.initComponentVersionListPageJarJdkVersion();
     * });
     */
    static initComponentVersionListPageJarJdkVersion(): void {
        if (!PageDetector.isInComponentVersionListPage()) return;
        this.addVersionColumn();
    }

    /**
     * 添加版本信息列到表格
     * 
     * @description
     * 功能描述：
     * 向组件版本列表表格中添加JDK版本信息列，并填充各版本的数据。
     * 
     * 适用场景：
     * - 版本列表页面增强
     * - 批量展示多个版本的JDK编译信息
     * 
     * 边界条件：
     * - 依赖页面中存在特定的DOM结构(.gridcontainer table.versions)
     * - 依赖jQuery进行DOM操作
     * 
     * @returns {void} 无返回值
     * 
     * @private 内部实现方法，不建议外部直接调用
     */
    private static addVersionColumn(): void {
        const table = $('.gridcontainer table.versions');
        this.addTableHeader(table);
        this.populateTableData(table);
    }

    /**
     * 添加表头列
     * 
     * @description
     * 功能描述：
     * 向版本列表表格添加"Build JDK Version"表头列。
     * 包含列标题和帮助链接图标。
     * 
     * 适用场景：
     * - 为版本列表表格增加新的列头
     * - 作为addVersionColumn方法的辅助实现
     * 
     * 边界条件：
     * - 依赖jQuery进行DOM操作
     * - 依赖页面中存在特定的DOM结构(thead tr th:contains("Version"))
     * - 表头列插入在"Version"列之后
     * 
     * @param {JQuery<HTMLElement>} table - 目标表格的jQuery对象
     * 
     * @returns {void} 无返回值
     * 
     * @private 内部辅助方法，不应由外部直接调用
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
     * 
     * @description
     * 功能描述：
     * 遍历版本列表表格中的每个版本行，为每个版本创建并添加JDK版本信息单元格。
     * 使用线程池控制并发请求数，异步加载每个版本的JDK信息。
     * 
     * 适用场景：
     * - 批量处理多个版本的JDK信息
     * - 需要限制并发请求数量的场景
     * - 页面加载后的数据填充
     * 
     * 边界条件：
     * - 依赖jQuery进行DOM操作
     * - 使用PromiseThreadPool控制并发
     * - 从Settings获取用户配置的并发数，如无则使用默认值
     * - 异步处理，不阻塞页面渲染
     * 
     * @param {JQuery<HTMLElement>} table - 目标表格的jQuery对象
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作开始后立即resolve
     * 
     * @throws {Error} 如果解析过程中出错，异常会被记录但不会中断其他版本的处理
     * 
     * @private 内部辅助方法，不应由外部直接调用
     */
    private static async populateTableData(table: JQuery<HTMLElement>): Promise<void> {
        const {groupId, artifactId} = this.parseGAV();
        if (!groupId || !artifactId) return;

        const settings = await Settings.findSettings() ?? new Settings();
        const threadNum = settings.concurrency || this.DEFAULT_CONCURRENCY;
        logger.debug(`线程池初始化，最大并发数：${threadNum}`);
        const threadPool = new PromiseThreadPool(threadNum);
        
        let taskCount = 0;
        
        table.find('tbody tr td').each((index, element) => {
            const versionLink = $(element).find('.vbtn');
            if (versionLink.length !== 1) return;

            const version = versionLink.text().trim();
            const repoPath = $(element).next().next().find("a").attr("href");
            const cellId = IdUtil.randomId();

            $(element).after(`<td id="${cellId}"><div class="loading-spinner"></div></td>`);

            taskCount++;
            const taskId = `task-${taskCount}`;
            logger.debug(`提交任务 ${taskId}：[${groupId}:${artifactId}:${version}]，当前队列状态: ${JSON.stringify(threadPool.status)}`);
            
            threadPool.submit(async () => {
                logger.debug(`开始执行任务 ${taskId}：[${groupId}:${artifactId}:${version}]，当前线程池状态: ${JSON.stringify(threadPool.status)}`);
                try {
                    const result = await this.processVersion(
                        groupId,
                        artifactId,
                        version,
                        cellId,
                        repoPath ?? ""
                    );
                    logger.debug(`任务 ${taskId} 完成：[${groupId}:${artifactId}:${version}]，当前线程池状态: ${JSON.stringify(threadPool.status)}`);
                    return result;
                } catch (error) {
                    logger.error(`任务 ${taskId} 失败：[${groupId}:${artifactId}:${version}]，当前线程池状态: ${JSON.stringify(threadPool.status)}`);
                    throw error;
                }
            });
        });
        
        logger.debug(`所有任务已提交，共 ${taskCount} 个任务，当前线程池状态: ${JSON.stringify(threadPool.status)}`);
    }

    /**
     * 处理单个版本信息
     * 
     * @description
     * 功能描述：
     * 处理单个版本的JDK信息获取和展示。
     * 首先获取仓库信息(可能从缓存中获取)，然后构建JAR URL，
     * 最后调用JarJdkVersionDetector解析并展示JDK版本信息。
     * 
     * 适用场景：
     * - 处理单个版本的JDK信息
     * - 由populateTableData方法通过线程池调用
     * 
     * 边界条件：
     * - 依赖仓库信息获取
     * - 可能需要网络请求获取仓库信息
     * - 依赖JarJdkVersionDetector解析JAR文件
     * - 异常会被记录并向上传播
     * 
     * @param {string} groupId - Maven GroupID
     * @param {string} artifactId - Maven ArtifactID
     * @param {string} version - 组件版本号
     * @param {string} cellId - 表格单元格ID
     * @param {string} repoPath - 仓库详情页路径
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 如果获取仓库信息或解析JAR文件过程中出错
     * 
     * @private 内部辅助方法，不应由外部直接调用
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
     * 
     * @description
     * 功能描述：
     * 从仓库详情页获取仓库基础URL信息。
     * 请求页面内容，解析出仓库URL，并将信息保存到本地缓存。
     * 
     * 适用场景：
     * - 需要获取JAR包下载URL的基础部分
     * - 仓库信息缓存不存在时调用
     * 
     * 边界条件：
     * - 依赖jQuery进行网络请求和DOM解析
     * - 依赖页面中存在特定的DOM结构(.im-subtitle)
     * - 依赖RepoInformationStorage进行缓存操作
     * 
     * @param {string} repoPath - 仓库详情页路径
     * 
     * @returns {Promise<RepoInformation>} 返回包含仓库信息的对象
     * 
     * @throws {Error} 如果网络请求失败或页面结构不符合预期
     * 
     * @private 内部辅助方法，不应由外部直接调用
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
     * 
     * @description
     * 功能描述：
     * 从页面面包屑导航中解析当前构件的GroupId和ArtifactId。
     * 
     * 适用场景：
     * - 获取当前页面对应的Maven坐标信息
     * - 准备批量处理版本信息前的必要数据
     * 
     * 边界条件：
     * - 依赖jQuery进行DOM查询
     * - 依赖页面中存在特定的DOM结构(.breadcrumb)
     * - 面包屑文本格式应为"Home » [GroupId] » [ArtifactId]"
     * - 如果解析失败，返回的字段可能为null
     * 
     * @returns {Object} 包含以下属性的对象:
     *   - groupId: string | null - 解析出的GroupId，解析失败时为null
     *   - artifactId: string | null - 解析出的ArtifactId，解析失败时为null
     * 
     * @private 内部辅助方法，不应由外部直接调用
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
     * 
     * @description
     * 功能描述：
     * 在页面单元格中显示错误信息，同时记录详细错误日志。
     * 
     * 适用场景：
     * - 处理版本信息获取过程中的异常
     * - 向用户提供失败反馈
     * 
     * 边界条件：
     * - 依赖jQuery进行DOM操作
     * - 依赖logger进行错误记录
     * - 错误信息会被简化显示，详细信息记录到日志
     * 
     * @param {string} cellId - 表格单元格ID
     * @param {Error} error - 错误对象
     * 
     * @returns {void} 无返回值
     * 
     * @private 内部辅助方法，不应由外部直接调用
     */
    private static handleError(cellId: string, error: Error): void {
        $(`#${cellId}`).html(`
            <span style="color: #dc3545">Error</span>
            <div style="font-size: 0.8em; color: #6c757d">${error.message}</div>
        `);
        logger.error(`[${cellId}] 处理失败:`, error);
    }

}