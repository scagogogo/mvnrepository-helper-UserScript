import MavenUtil from "../../../utils/MavenUtil";
import ManifestParser from "../parser/ManifestParser";
import JarClassParser from "../parser/JarClassParser";
import JarDownloadProgress from "../ui/JarDownloadProgress";
import JarClassAnalyzer from "../ui/JarClassAnalyzer";
import ErrorHandler from "../ui/ErrorHandler";
import JarManifestAnalyzer from "../ui/JarManifestAnalyzer";
import GavJarInformationStorage, {GavJarInformation} from "../../../database/GavJarInformationStorage";
import {logger} from "../../../logger/Logger";

// @ts-ignore
import JSZip from 'jszip';


/**
 * JDK版本检测器类，用于解析JAR包的JDK版本信息
 */
export default class JarJdkVersionDetector {
    /**
     * 解析GAV坐标的JAR包编译信息并在界面展示
     * 
     * @description
     * 功能描述：
     * 分析Maven构件(JAR包)的编译JDK版本信息，并将结果显示在指定DOM元素中。
     * 首先会检查缓存中是否已有相关信息，如有则直接展示；
     * 否则会下载JAR文件进行分析，并缓存结果供后续使用。
     * 
     * 适用场景：
     * - 需要了解Maven构件编译环境的场景
     * - 排查JAR包兼容性问题
     * - 在Maven仓库浏览页面中增强显示构件信息
     * 
     * 边界条件：
     * - 依赖网络环境下载JAR文件
     * - 对大型JAR文件处理可能较慢
     * - 需要浏览器IndexedDB支持以存储缓存信息
     * 
     * @param {string} groupId - Maven groupId，如'org.apache.dubbo'
     * @param {string} artifactId - Maven artifactId，如'dubbo'
     * @param {string} version - Maven版本号，如'3.2.4'
     * @param {string} elementId - 展示结果的DOM元素ID，方法将在此元素内展示分析结果
     * @param {string} [jarUrl] - 可选的JAR文件URL，如不提供则自动根据GAV信息生成URL
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 当JAR文件下载失败或解析过程中出错时抛出异常
     * 
     * @example
     * // 基本用法：提供GAV坐标和展示元素ID
     * await JarJdkVersionDetector.resolveJarJdkVersion(
     *   'org.apache.dubbo',
     *   'dubbo',
     *   '3.2.4',
     *   'jdk-version-display'
     * );
     * 
     * // 指定JAR URL的用法
     * await JarJdkVersionDetector.resolveJarJdkVersion(
     *   'org.apache.dubbo',
     *   'dubbo',
     *   '3.2.4',
     *   'jdk-version-display',
     *   'https://repo1.maven.org/maven2/org/apache/dubbo/dubbo/3.2.4/dubbo-3.2.4.jar'
     * );
     */
    static async resolveJarJdkVersion(
        groupId: string,
        artifactId: string,
        version: string,
        elementId: string,
        jarUrl?: string
    ): Promise<void> {
        const jarInformation = await GavJarInformationStorage.find(groupId, artifactId, version);
        if (await this.isJarInformationCacheValid(jarInformation)) {
            await this.showCacheResult(elementId, jarInformation!);
        } else {
            await this.requestAndAnalyzeJarFile(groupId, artifactId, version, elementId, jarUrl);
        }
    }

    /**
     * 展示缓存结果
     * 
     * @description
     * 功能描述：
     * 从缓存中读取JAR包分析结果并在界面上展示，包括Manifest信息和Class文件版本分析。
     * 复用已有分析结果，避免重复下载和解析JAR文件。
     * 
     * 适用场景：
     * - 缓存命中时快速展示分析结果
     * - 提升用户体验，减少等待时间
     * 
     * 边界条件：
     * - 依赖缓存中数据的完整性和正确性
     * - 需要UI组件支持以正确展示分析结果
     * 
     * @param {string} elementId - DOM元素ID，将在此元素内展示分析结果
     * @param {GavJarInformation} jarInformation - JAR包信息对象，包含manifest内容和class文件分析结果
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 展示过程中出现错误可能会抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const jarInfo = await GavJarInformationStorage.find('org.apache.dubbo', 'dubbo', '3.2.4');
     * if (jarInfo) {
     *   await JarJdkVersionDetector.showCacheResult('display-element', jarInfo);
     * }
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async showCacheResult(
        elementId: string,
        jarInformation: GavJarInformation
    ): Promise<void> {
        // 展示manifest信息
        const manifestResult = ManifestParser.parseBuildJdkVersion(jarInformation.manifest);
        await new JarManifestAnalyzer(
            elementId,
            jarInformation.manifest,
            manifestResult.key,
            manifestResult.value
        ).showJarManifestAnalyzeResult();

        // 展示class文件分析结果
        await JarClassAnalyzer.show(
            elementId,
            jarInformation.metric,
            jarInformation!.maxMajorVersion!,
            jarInformation!.maxMinorVersion!
        );
    }

    /**
     * 验证缓存是否有效
     * 
     * @description
     * 功能描述：
     * 检查JAR信息缓存是否完整有效，判断标准是同时包含Manifest分析和Class文件分析结果。
     * 确保展示给用户的是完整且可靠的分析结果。
     * 
     * 适用场景：
     * - 决定是否需要重新下载和分析JAR文件
     * - 避免使用不完整的缓存数据
     * 
     * 边界条件：
     * - 只检查缓存完整性，不验证内容正确性
     * - null或undefined的输入被视为无效缓存
     * 
     * @param {GavJarInformation | null | undefined} jarInformation - 待验证的JAR包信息对象
     * 
     * @returns {Promise<boolean>} 返回一个Promise，resolve为布尔值：
     *   - true: 缓存有效且完整
     *   - false: 缓存无效或不完整
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const jarInfo = await GavJarInformationStorage.find('org.example', 'lib', '1.0.0');
     * if (await JarJdkVersionDetector.isJarInformationCacheValid(jarInfo)) {
     *   console.log('缓存有效，可以使用');
     * } else {
     *   console.log('缓存无效，需要重新分析');
     * }
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async isJarInformationCacheValid(
        jarInformation: GavJarInformation | null | undefined
    ): Promise<boolean> {
        return !!(
            jarInformation &&
            jarInformation.manifestDetectDone &&
            jarInformation.jarClassDetectDone
        );
    }

    /**
     * 请求并分析JAR文件
     * 
     * @description
     * 功能描述：
     * 下载指定的JAR文件并进行完整分析，包括提取Manifest信息和分析Class文件版本。
     * 整个过程会显示下载进度，并在分析完成后更新界面展示结果。
     * 
     * 适用场景：
     * - 缓存未命中时执行完整分析流程
     * - 首次分析特定JAR包
     * - 强制刷新分析结果
     * 
     * 边界条件：
     * - 依赖网络环境下载JAR文件
     * - 大型JAR文件可能导致处理时间较长
     * - 下载失败会展示错误信息
     * 
     * @param {string} groupId - Maven groupId，标识构件所属的组
     * @param {string} artifactId - Maven artifactId，标识构件名称
     * @param {string} version - Maven版本号，标识构件版本
     * @param {string} elementId - DOM元素ID，用于展示分析结果和下载进度
     * @param {string} [jarUrl] - 可选的JAR文件URL，不提供则自动生成
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 下载或解析过程中出错时抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * await JarJdkVersionDetector.requestAndAnalyzeJarFile(
     *   'com.example',
     *   'library',
     *   '2.0.0',
     *   'result-container'
     * );
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async requestAndAnalyzeJarFile(
        groupId: string,
        artifactId: string,
        version: string,
        elementId: string,
        jarUrl?: string
    ): Promise<void> {
        try {
            const targetUrl = jarUrl || MavenUtil.buildJarUrl(groupId, artifactId, version);
            logger.debug(`groupId = ${groupId}, artifactId = ${artifactId}, version = ${version}, 开始请求Jar包，Jar URL：${targetUrl}`);
            const response = await this.fetchJarWithProgress(elementId, targetUrl);
            logger.debug(`groupId = ${groupId}, artifactId = ${artifactId}, version = ${version}, Jar包请求完毕，开始解析Jar包信息`);
            await this.analyzeJarFile(groupId, artifactId, version, elementId)(response);
        } catch (error) {
            this.showRequestJarFailedMessage(elementId, jarUrl)(error as Error);
            throw error;
        }
    }

    /**
     * 带进度条的JAR文件下载
     * 
     * @description
     * 功能描述：
     * 使用GM_xmlhttpRequest下载JAR文件，并通过进度条实时显示下载进度。
     * 支持大文件下载，通过节流方式限制进度更新频率以提高性能。
     * 
     * 适用场景：
     * - 需要下载较大JAR文件时提供视觉反馈
     * - 增强用户体验，避免长时间无反馈的等待
     * 
     * 边界条件：
     * - 依赖Tampermonkey/Greasemonkey API
     * - 节流控制：每100ms最多更新一次进度，避免频繁DOM更新
     * - 下载失败会reject返回的Promise
     * 
     * @param {string} elementId - DOM元素ID，用于显示下载进度
     * @param {string} jarUrl - JAR文件URL，指向要下载的文件
     * 
     * @returns {Promise<GMXMLHttpRequestResponse>} 返回一个Promise：
     *   - resolve: 请求成功时返回XMLHttpRequest响应对象
     *   - reject: 请求失败时返回Error对象
     * 
     * @throws {Error} 网络错误或请求被中断时抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * try {
     *   const response = await JarJdkVersionDetector.fetchJarWithProgress(
     *     'download-area',
     *     'https://repo1.maven.org/maven2/org/example/lib/1.0.0/lib-1.0.0.jar'
     *   );
     *   console.log('下载成功，响应状态:', response.status);
     * } catch (error) {
     *   console.error('下载失败:', error);
     * }
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static fetchJarWithProgress(
        elementId: string,
        jarUrl: string
    ): Promise<GMXMLHttpRequestResponse> {
        return new Promise((resolve, reject) => {
            let lastProgress = 0;

            // 定义 handleProgress 函数
            const handleProgress = (event: ProgressEvent): void => {
                const progress = event as unknown as { loaded: number; total: number; lengthComputable: boolean };
                if (Date.now() - lastProgress > 100) {
                    new JarDownloadProgress(elementId).showProgress(progress);
                    lastProgress = Date.now();
                }
            };

            GM_xmlhttpRequest({
                method: "GET",
                url: jarUrl,
                responseType: "arraybuffer",
                onload: (response: GMXMLHttpRequestResponse): void => {
                    resolve(response);
                    // new JarDownloadProgress(elementId).showProgress({ loaded: 0, total: 0, lengthComputable: true });
                },
                onerror: (error: Error): void => {
                    reject(error);
                },
                onprogress: (progress: ProgressEvent): void => {
                    handleProgress(progress);
                }
            });

        });
    }

    /**
     * 分析JAR文件核心方法
     * 
     * @description
     * 功能描述：
     * 返回一个处理函数，用于处理下载完成的JAR文件响应，进行解压和分析。
     * 会依次分析JAR的Manifest信息和Class文件版本，并将结果展示在界面上。
     * 
     * 适用场景：
     * - 处理下载完成的JAR文件响应
     * - 作为下载完成后的回调函数
     * 
     * 边界条件：
     * - 依赖JSZip库解析JAR文件内容
     * - 非200状态码的响应会被视为下载失败
     * - 解析过程可能因JAR文件结构问题失败
     * 
     * @param {string} groupId - Maven groupId
     * @param {string} artifactId - Maven artifactId
     * @param {string} version - Maven版本号
     * @param {string} elementId - DOM元素ID，用于展示分析结果
     * 
     * @returns {Function} 返回一个接收GMXMLHttpRequestResponse参数的异步处理函数
     * 
     * @throws {Error} HTTP状态码非200或JAR解析失败时抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const processResponse = JarJdkVersionDetector.analyzeJarFile(
     *   'org.example',
     *   'lib',
     *   '1.0.0',
     *   'result-container'
     * );
     * 
     * // 然后将其作为回调使用
     * fetchJar().then(processResponse).catch(handleError);
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static analyzeJarFile(
        groupId: string,
        artifactId: string,
        version: string,
        elementId: string
    ) {
        return async (response: GMXMLHttpRequestResponse): Promise<void> => {
            new JarDownloadProgress(elementId).removeProgress();

            if (response.status !== 200) {
                logger.error(`groupId = ${groupId}, artifactId = ${artifactId}, version = ${version}, Jar包请求失败：${response.status}`);
                await ErrorHandler.show(elementId, `下载失败 HTTP ${response.status}`);
                throw new Error(`HTTP ${response.status}`);
            }

            try {
                const jarFile = await new JSZip(response.response);
                logger.debug(`groupId = ${groupId}, artifactId = ${artifactId}, version = ${version}, Jar包解析为JSZip文件`);
                await this.analyzeManifest(groupId, artifactId, version, elementId, jarFile);
                await this.analyzeClasses(groupId, artifactId, version, elementId, jarFile);
            } catch (parseError) {
                logger.error(`groupId = ${groupId}, artifactId = ${artifactId}, version = ${version}, 解析Jar包信息失败：${(parseError as Error).message}`);
                await ErrorHandler.show(elementId, `解析JAR文件失败: ${(parseError as Error).message}`);
                throw parseError;
            }
        };
    }

    /**
     * 分析MANIFEST文件
     * 
     * @description
     * 功能描述：
     * 从JAR文件中提取并分析META-INF/MANIFEST.MF文件，解析构建环境信息。
     * 将分析结果展示在界面上，并保存到数据库中供后续使用。
     * 
     * 适用场景：
     * - 提取JAR包的构建环境信息
     * - 获取编译JDK版本信息
     * 
     * 边界条件：
     * - JAR中可能不包含MANIFEST.MF文件
     * - MANIFEST可能存在但不包含构建环境信息
     * - 依赖数据库操作保存分析结果
     * 
     * @param {string} groupId - Maven groupId
     * @param {string} artifactId - Maven artifactId
     * @param {string} version - Maven版本号
     * @param {string} elementId - DOM元素ID，用于展示分析结果
     * @param {JSZip} jarFile - 使用JSZip解析后的JAR文件对象
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 解析或数据库操作失败时可能抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const zip = await new JSZip(arrayBuffer);
     * await JarJdkVersionDetector.analyzeManifest(
     *   'org.example',
     *   'lib',
     *   '1.0.0',
     *   'result-container',
     *   zip
     * );
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async analyzeManifest(
        groupId: string,
        artifactId: string,
        version: string,
        elementId: string,
        jarFile: JSZip
    ): Promise<void> {

        const metaFileName = "META-INF/MANIFEST.MF";
        const manifestEntry = jarFile.files[metaFileName];
        const manifest = manifestEntry ? await manifestEntry.asText() : "";

        const manifestResult = ManifestParser.parseBuildJdkVersion(manifest);

        logger.debug(`groupId = ${groupId}, artifactId = ${artifactId}, version = ${version}, Jar包Manifest信息解析成功：${JSON.stringify(manifest)}`);
        await new JarManifestAnalyzer(elementId, manifest, manifestResult.key, manifestResult.value).showJarManifestAnalyzeResult();
        await this.saveManifestInfo(groupId, artifactId, version, manifest);
    }

    /**
     * 保存MANIFEST信息到数据库
     * 
     * @description
     * 功能描述：
     * 将解析得到的MANIFEST信息保存到IndexedDB数据库中，作为缓存供后续使用。
     * 如果数据库中已有相关记录则更新，否则创建新记录。
     * 
     * 适用场景：
     * - 缓存分析结果避免重复下载和解析
     * - 提高应用响应速度和用户体验
     * 
     * 边界条件：
     * - 依赖浏览器IndexedDB支持
     * - 写入操作可能因存储空间限制或权限问题失败
     * - 同一GAV坐标的信息会被更新覆盖
     * 
     * @param {string} groupId - Maven groupId
     * @param {string} artifactId - Maven artifactId
     * @param {string} version - Maven版本号
     * @param {string | null} manifest - MANIFEST.MF文件内容，可能为null表示JAR中不存在该文件
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 数据库操作失败时可能抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * await JarJdkVersionDetector.saveManifestInfo(
     *   'org.example',
     *   'lib',
     *   '1.0.0',
     *   'Manifest-Version: 1.0\nBuild-Jdk: 1.8.0_202'
     * );
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async saveManifestInfo(
        groupId: string,
        artifactId: string,
        version: string,
        manifest: string | null
    ): Promise<void> {
        let jarInformation = await GavJarInformationStorage.find(groupId, artifactId, version);
        if (!jarInformation) {
            jarInformation = new GavJarInformation();
            jarInformation!.groupId = groupId;
            jarInformation!.artifactId = artifactId;
            jarInformation!.version = version;
        }

        jarInformation!.manifest = manifest;
        jarInformation!.manifestDetectDone = true;
        await jarInformation!.id ? GavJarInformationStorage.save(jarInformation!) : await GavJarInformationStorage.save(jarInformation!);
    }

    /**
     * 分析class文件版本
     * 
     * @description
     * 功能描述：
     * 使用JarClassParser从JAR包中解析所有Class文件的版本信息，统计各JDK版本的分布。
     * 将分析结果展示在界面上，并保存到数据库中作为缓存。
     * 
     * 适用场景：
     * - 分析JAR包中使用的JDK编译版本
     * - 了解JAR包的兼容性信息
     * 
     * 边界条件：
     * - 需要解析JAR中所有.class文件，对大型JAR可能耗时较长
     * - 对非标准格式的Class文件可能无法正确解析
     * - 依赖数据库操作保存结果
     * 
     * @param {string} groupId - Maven groupId
     * @param {string} artifactId - Maven artifactId
     * @param {string} version - Maven版本号
     * @param {string} elementId - DOM元素ID，用于展示分析结果
     * @param {JSZip} jarFile - 使用JSZip解析后的JAR文件对象
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 解析或数据库操作失败时可能抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const zip = await new JSZip(arrayBuffer);
     * await JarJdkVersionDetector.analyzeClasses(
     *   'com.example',
     *   'library',
     *   '2.0.0',
     *   'version-display',
     *   zip
     * );
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async analyzeClasses(
        groupId: string,
        artifactId: string,
        version: string,
        elementId: string,
        jarFile: JSZip
    ): Promise<void> {
        const {metric, maxMajorVersion, maxMinorVersion} = JarClassParser.parseClassBuildJdkVersionMetric(jarFile);
        await JarClassAnalyzer.show(elementId, metric, maxMajorVersion, maxMinorVersion);
        await this.saveClassInfo(groupId, artifactId, version, metric, maxMajorVersion, maxMinorVersion);
    }

    /**
     * 保存class分析结果到数据库
     * 
     * @description
     * 功能描述：
     * 将Class文件版本分析结果保存到IndexedDB数据库中，作为缓存供后续使用。
     * 如果数据库中已有相关记录则更新，否则创建新记录。
     * 
     * 适用场景：
     * - 缓存分析结果避免重复下载和解析
     * - 提高应用响应速度和用户体验
     * 
     * 边界条件：
     * - 依赖浏览器IndexedDB支持
     * - 写入操作可能因存储空间限制或权限问题失败
     * - 同一GAV坐标的信息会被更新覆盖
     * 
     * @param {string} groupId - Maven groupId
     * @param {string} artifactId - Maven artifactId
     * @param {string} version - Maven版本号
     * @param {Map<number, number>} metric - Class文件版本分布统计，键为版本号，值为对应版本的文件数量
     * @param {number} maxMajorVersion - 检测到的最高主版本号
     * @param {number} maxMinorVersion - 检测到的最高次版本号
     * 
     * @returns {Promise<void>} 无返回值的Promise，操作完成后resolve
     * 
     * @throws {Error} 数据库操作失败时可能抛出异常
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const metric = new Map([
     *   [52, 120], // Java 8: 120个class文件
     *   [55, 30]   // Java 11: 30个class文件
     * ]);
     * await JarJdkVersionDetector.saveClassInfo(
     *   'org.example',
     *   'lib',
     *   '1.0.0',
     *   metric,
     *   55, // 最高版本Java 11
     *   0
     * );
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static async saveClassInfo(
        groupId: string,
        artifactId: string,
        version: string,
        metric: Map<number, number>,
        maxMajorVersion: number,
        maxMinorVersion: number
    ): Promise<void> {
        let jarInformation = await GavJarInformationStorage.find(groupId, artifactId, version);
        if (!jarInformation) {
            jarInformation = new GavJarInformation();
            jarInformation!.groupId = groupId;
            jarInformation!.artifactId = artifactId;
            jarInformation!.version = version;
        }

        jarInformation!.metric = metric;
        jarInformation!.maxMajorVersion = maxMajorVersion;
        jarInformation!.maxMinorVersion = maxMinorVersion;
        jarInformation!.jarClassDetectDone = true;
        await jarInformation!.id ? GavJarInformationStorage.save(jarInformation!) : GavJarInformationStorage.save(jarInformation!);
    }

    /**
     * 显示下载失败信息
     * 
     * @description
     * 功能描述：
     * 返回一个处理函数，用于在JAR文件下载失败时展示错误信息。
     * 会清除下载进度条并在指定元素中显示错误详情。
     * 
     * 适用场景：
     * - 处理JAR下载失败的错误情况
     * - 向用户提供友好的错误反馈
     * 
     * 边界条件：
     * - 依赖DOM操作展示错误信息
     * - 如果指定的elementId不存在，则不会显示错误信息
     * 
     * @param {string} elementId - DOM元素ID，用于显示错误信息
     * @param {string} [jarUrl] - 可选的JAR文件URL，用于在错误信息中提供更多上下文
     * 
     * @returns {Function} 返回一个接收Error参数的处理函数
     * 
     * @example
     * // 内部调用示例，通常不直接调用
     * const errorHandler = JarJdkVersionDetector.showRequestJarFailedMessage(
     *   'download-result',
     *   'https://example.com/path/to/library.jar'
     * );
     * 
     * // 然后将其作为错误处理回调使用
     * fetchJar().catch(errorHandler);
     * 
     * @private 内部方法，不建议外部直接调用
     */
    private static showRequestJarFailedMessage(elementId: string, jarUrl?: string) {
        return (error: Error): void => {
            new JarDownloadProgress(elementId).removeProgress();
            const errorElement = document.getElementById(elementId);
            if (errorElement) {
                errorElement.textContent = `无法下载JAR文件（${jarUrl}）：${error.message}`;
            }
        };
    }
}