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

// 定义进度事件细节类型
interface ProgressDetail {
    loaded: number;
    total: number;
    lengthComputable: boolean;
}

// 定义自定义事件类型
declare global {
    interface HTMLElementEventMap {
        progress: CustomEvent<ProgressDetail>;
    }
}

/**
 * JDK版本检测器类，用于解析JAR包的JDK版本信息
 */
export default class JarJdkVersionDetector {
    /**
     * 解析GAV坐标的JAR包编译信息并在界面展示
     * @param groupId - Maven groupId
     * @param artifactId - Maven artifactId
     * @param version - Maven版本号
     * @param elementId - 展示结果的DOM元素ID
     * @param jarUrl - 可选的JAR文件URL（默认自动生成）
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
     * @param elementId - DOM元素ID
     * @param jarInformation - JAR包信息对象
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
     * @param jarInformation - 待验证的JAR包信息
     * @returns 是否有效的布尔值
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
     * @param groupId - Maven groupId
     * @param artifactId - Maven artifactId
     * @param version - Maven版本号
     * @param elementId - DOM元素ID
     * @param jarUrl - 可选的JAR文件URL
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
     * @param elementId - DOM元素ID
     * @param jarUrl - JAR文件URL
     * @returns 请求响应Promise
     */
    private static fetchJarWithProgress(
        elementId: string,
        jarUrl: string
    ): Promise<GMXMLHttpRequestResponse> {
        return new Promise((resolve, reject) => {
            const progressChannel = new EventTarget();
            let lastProgress = 0;

            // 定义 handleProgress 函数
            const jarDownloadProgress = new JarDownloadProgress(elementId);
            const handleProgress = (event: Event): void => {
                const progress = event as unknown as { loaded: number; total: number; lengthComputable: boolean };
                if (Date.now() - lastProgress > 100) {
                    jarDownloadProgress.showProgress(progress);
                    lastProgress = Date.now();
                }
            };

            GM_xmlhttpRequest({
                method: "GET",
                url: jarUrl,
                responseType: "arraybuffer",
                onload: (response: GMXMLHttpRequestResponse): void => {
                    progressChannel.removeEventListener("progress", handleProgress);
                    resolve(response);
                },
                onerror: (error: Error): void => {
                    progressChannel.removeEventListener("progress", handleProgress);
                    reject(error);
                },
                onprogress: (event: Event): void => {
                    progressChannel.dispatchEvent(new CustomEvent("progress", {detail: event}));
                }
            });

            progressChannel.addEventListener("progress", handleProgress);
        });
    }

    /**
     * 分析JAR文件核心方法
     * @param groupId - Maven groupId
     * @param artifactId - Maven artifactId
     * @param version - Maven版本号
     * @param elementId - DOM元素ID
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
     * @param groupId
     * @param artifactId
     * @param version
     * @param elementId
     * @param jarFile - JSZip实例
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