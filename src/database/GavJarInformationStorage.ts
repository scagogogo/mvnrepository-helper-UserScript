import Database from "./Database";

/**
 * GAV Jar信息存储的对象存储空间名称常量
 * 
 * 用于在IndexedDB数据库中标识存储JAR包信息的对象存储空间
 * 该常量值为"gav-jar-information-storage"，在创建数据库时会自动创建此存储空间
 * GAV是指Group ID、Artifact ID和Version的缩写，是Maven坐标系统的核心组成部分
 */
const STORE_NAME = "gav-jar-information-storage";

/**
 * GAV Jar信息实体类
 * 
 * 用于存储和管理Maven JAR包的元数据信息，特别是关于JAR包兼容的JDK版本信息
 * 主要存储以下信息：
 * 1. Maven坐标信息（groupId, artifactId, version）
 * 2. JAR包内部结构信息（MANIFEST.MF内容）
 * 3. JAR包字节码版本信息（最大主版本号和次版本号，用于判断JDK兼容性）
 * 4. 代码质量指标数据
 * 
 * 数据持久化：
 * - 所有信息将存储在IndexedDB的gav-jar-information-storage空间中
 * - 使用groupId:artifactId:version作为主键
 * 
 * 主要用途：
 * - 分析和展示JAR包兼容的JDK版本
 * - 缓存已分析过的JAR包信息，避免重复处理
 * - 提供代码质量和依赖分析的数据基础
 *
 * 属性说明：
 * @property {string | null} id - 由groupId:artifactId:version组成的唯一标识
 *                              作为数据库主键使用，格式为"groupId:artifactId:version"
 * @property {string | null} groupId - Maven Group ID
 *                                   表示组织或项目的唯一标识符，如"org.springframework"
 * @property {string | null} artifactId - Maven Artifact ID
 *                                      表示项目中的某个模块，如"spring-core"
 * @property {string | null} version - 组件版本号
 *                                   表示特定版本，如"5.3.20"
 * @property {boolean} manifestDetectDone - 清单文件检测完成标记
 *                                        为true表示已完成MANIFEST.MF文件的检测
 * @property {any | null} manifest - 解析出的MANIFEST.MF信息
 *                                 包含JAR包的元数据，如版本、创建时间、依赖等
 * @property {boolean} jarClassDetectDone - class文件检测完成标记
 *                                        为true表示已完成对JAR包中class文件的版本检测
 * @property {any | null} metric - 代码度量指标数据
 *                               包含代码行数、复杂度等质量指标
 * @property {number | null} maxMajorVersion - class文件最大主版本号
 *                                           表示JAR包兼容的最高JDK主版本号
 * @property {number | null} maxMinorVersion - class文件最大次版本号
 *                                           表示JAR包兼容的最高JDK次版本号
 */
export class GavJarInformation {
    /**
     * 唯一标识符
     * 
     * 由groupId:artifactId:version组成的唯一字符串
     * 作为数据库主键使用
     * 示例值："org.springframework:spring-core:5.3.20"
     */
    id: string | null = null;
    
    /**
     * Maven Group ID
     * 
     * 表示组织或项目的唯一标识符
     * 通常是域名的反写形式
     * 示例值："org.springframework", "com.google.guava"
     */
    groupId: string | null = null;
    
    /**
     * Maven Artifact ID
     * 
     * 表示项目中的某个模块或构件名称
     * 通常是简短的小写字母组合
     * 示例值："spring-core", "guava"
     */
    artifactId: string | null = null;
    
    /**
     * 组件版本号
     * 
     * 表示构件的特定版本
     * 可以是数字版本号、带有限定符的版本号或日期版本号
     * 示例值："5.3.20", "31.1-jre", "1.0-SNAPSHOT"
     */
    version: string | null = null;
    
    /**
     * 清单文件检测完成标记
     * 
     * 用于标记是否已完成对MANIFEST.MF文件的检测
     * true表示已完成检测，false表示尚未检测
     * 默认值为false
     */
    manifestDetectDone: boolean = false;
    
    /**
     * 解析出的MANIFEST.MF信息
     * 
     * 存储JAR包中MANIFEST.MF文件的解析结果
     * 包含JAR包的元数据，如版本、创建时间、依赖等
     * 如果未检测或未找到清单文件，则为null
     */
    manifest: any | null = null;
    
    /**
     * class文件检测完成标记
     * 
     * 用于标记是否已完成对JAR包中class文件的版本检测
     * true表示已完成检测，false表示尚未检测
     * 默认值为false
     */
    jarClassDetectDone: boolean = false;
    
    /**
     * 代码度量指标数据
     * 
     * 存储JAR包的代码质量指标数据
     * 可能包含代码行数、复杂度、单元测试覆盖率等信息
     * 如果未检测，则为null
     */
    metric: any | null = null;
    
    /**
     * class文件最大主版本号
     * 
     * 表示JAR包中所有class文件中最高的JDK主版本号
     * 用于判断JAR包兼容的最低JDK版本
     * 如 52 对应 Java 8, 55 对应 Java 11
     * 未检测时为null
     */
    maxMajorVersion: number | null = null;
    
    /**
     * class文件最大次版本号
     * 
     * 表示JAR包中所有class文件中最高的JDK次版本号
     * 与maxMajorVersion结合使用，判断确切的版本兼容性
     * 通常为0
     * 未检测时为null
     */
    maxMinorVersion: number | null = null;
}

/**
 * GAV Jar信息存储管理类
 * 
 * 提供对Maven JAR包信息的存储和查询功能
 * 使用IndexedDB作为持久化存储，支持异步操作
 * 
 * 主要功能：
 * - 保存/更新JAR包信息
 * - 查询特定GAV坐标的JAR包信息
 * - 生成标准化的GAV ID
 * 
 * 设计特点：
 * - 所有方法都是静态的，无需实例化
 * - 使用异步Promise接口，支持现代JavaScript异步模式
 * - 采用GAV(GroupId:ArtifactId:Version)作为唯一标识
 * 
 * 性能考虑：
 * - 查询操作使用只读事务，性能开销小
 * - 缓存已分析的JAR包信息，避免重复处理
 * 
 * 使用场景：
 * - 分析JAR包兼容的JDK版本前，先查询是否已有缓存
 * - 保存已分析的JAR包信息，用于后续快速查询
 * - 收集多个JAR包的信息，用于依赖分析和兼容性检查
 *
 * 使用示例：
 * @example
 * // 保存JAR包信息
 * const info = new GavJarInformation();
 * info.groupId = 'com.google.guava';
 * info.artifactId = 'guava';
 * info.version = '31.1-jre';
 * info.maxMajorVersion = 55; // 对应Java 11
 * info.jarClassDetectDone = true;
 * await GavJarInformationStorage.save(info);
 *
 * // 查询JAR包信息
 * const result = await GavJarInformationStorage.find('com.google.guava', 'guava', '31.1-jre');
 * if (result && result.jarClassDetectDone) {
 *   console.log(`Guava 31.1-jre 需要的JDK版本: ${GavJarInformationStorage.getJavaVersion(result.maxMajorVersion)}`);
 * } else {
 *   console.log('尚未分析此JAR包或未找到信息');
 * }
 */
export default class GavJarInformationStorage {
    /**
     * 保存或更新Jar信息到数据库
     * 
     * 将JAR包信息对象持久化到IndexedDB中
     * 如果指定ID的记录已存在，则更新信息
     * 
     * 数据验证：
     * - 确保groupId、artifactId和version字段不为空且有有效值
     * - 自动生成并设置id字段
     * 
     * 事务处理：
     * - 使用"readwrite"事务模式确保数据完整性
     * - 异步操作，不会阻塞UI线程
     *
     * @param {GavJarInformation} data - 需要存储的Jar信息对象
     *                                - 必须是GavJarInformation类的实例
     *                                - groupId、artifactId、version字段必须有非空值
     * 
     * @returns {Promise<void>} 操作完成的Promise
     *                        - 成功：Promise解析为undefined
     *                        - 失败：Promise拒绝并提供错误信息
     * 
     * @throws {Error} 当数据校验失败时抛出异常
     *               - "缺少必要的GAV参数"：groupId、artifactId或version为null或undefined
     *               - "GAV参数不能为空"：groupId、artifactId或version为空字符串或只包含空白字符
     *               - 其他数据库操作相关异常
     * 
     * 使用示例：
     * @example
     * // 保存基本信息
     * try {
     *   const info = new GavJarInformation();
     *   info.groupId = 'org.springframework';
     *   info.artifactId = 'spring-core';
     *   info.version = '5.3.20';
     *   await GavJarInformationStorage.save(info);
     *   console.log('JAR包基本信息已保存');
     * } catch (error) {
     *   console.error('保存JAR包信息失败:', error);
     * }
     * 
     * // 保存完整分析信息
     * try {
     *   // 先查询是否已有基本信息
     *   let info = await GavJarInformationStorage.find('org.springframework', 'spring-core', '5.3.20');
     *   
     *   // 如果不存在，创建新对象
     *   if (!info) {
     *     info = new GavJarInformation();
     *     info.groupId = 'org.springframework';
     *     info.artifactId = 'spring-core';
     *     info.version = '5.3.20';
     *   }
     *   
     *   // 添加分析结果
     *   info.maxMajorVersion = 52; // Java 8
     *   info.maxMinorVersion = 0;
     *   info.jarClassDetectDone = true;
     *   info.manifest = { 
     *     'Implementation-Vendor': 'Spring Framework',
     *     'Implementation-Version': '5.3.20',
     *     'Built-By': 'spring'
     *   };
     *   info.manifestDetectDone = true;
     *   
     *   // 保存更新后的信息
     *   await GavJarInformationStorage.save(info);
     *   console.log('JAR包完整分析信息已保存');
     * } catch (error) {
     *   console.error('保存JAR包分析信息失败:', error);
     * }
     */
    static async save(data: GavJarInformation): Promise<void> {
        if (!data.groupId || !data.artifactId || !data.version) {
            throw new Error("缺少必要的GAV参数");
        }
        if (!data.groupId?.trim() || !data.artifactId?.trim() || !data.version?.trim()) {
            throw new Error("GAV参数不能为空");
        }

        data.id = this.buildId(data.groupId, data.artifactId, data.version);

        const transaction = Database.getDatabase().transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        await objectStore.put(data); // 直接使用 await
    }

    /**
     * 查询指定GAV的Jar信息
     * 
     * 根据Maven GAV坐标从数据库中检索JAR包信息
     * 如果信息不存在，则返回undefined
     * 
     * 查询流程：
     * 1. 根据输入的GAV生成唯一ID
     * 2. 使用ID在数据库中查找对应记录
     * 3. 返回查找结果或undefined
     * 
     * 性能特性：
     * - 使用"readonly"事务模式，多个查询可并发执行
     * - 查询速度快，通常在几毫秒内完成
     * 
     * 注意事项：
     * - 调用前需确保Database已初始化
     * - 参数区分大小写，需精确匹配
     *
     * @param {string} groupId - 组织标识
     *                         - Maven Group ID，如"org.springframework"
     *                         - 区分大小写，需精确匹配
     * 
     * @param {string} artifactId - 构件标识
     *                            - Maven Artifact ID，如"spring-core"
     *                            - 区分大小写，需精确匹配
     * 
     * @param {string} version - 版本号
     *                         - Maven Version，如"5.3.20"
     *                         - 区分大小写，需精确匹配
     * 
     * @returns {Promise<GavJarInformation | undefined>} 查询结果
     *                                                 - 成功找到：Promise解析为GavJarInformation对象
     *                                                 - 未找到：Promise解析为undefined
     *                                                 - 查询失败：Promise拒绝并提供错误信息
     * 
     * 使用示例：
     * @example
     * // 基本查询用法
     * try {
     *   const jarInfo = await GavJarInformationStorage.find(
     *     'org.springframework', 
     *     'spring-core', 
     *     '5.3.20'
     *   );
     *   
     *   if (jarInfo) {
     *     if (jarInfo.jarClassDetectDone) {
     *       console.log(`JDK版本要求: ${jarInfo.maxMajorVersion}`);
     *     } else {
     *       console.log('JAR包已记录但尚未完成类文件分析');
     *     }
     *   } else {
     *     console.log('未找到此JAR包的信息记录');
     *   }
     * } catch (error) {
     *   console.error('查询JAR包信息失败:', error);
     * }
     * 
     * // 与业务逻辑结合使用
     * async function checkJarJdkCompatibility(groupId, artifactId, version) {
     *   // 先查询缓存
     *   const jarInfo = await GavJarInformationStorage.find(groupId, artifactId, version);
     *   
     *   // 如果已有分析结果，直接使用
     *   if (jarInfo && jarInfo.jarClassDetectDone) {
     *     return {
     *       needsAnalysis: false,
     *       jdkVersion: jarInfo.maxMajorVersion,
     *       compatible: jarInfo.maxMajorVersion <= 52 // 假设目标环境是JDK 8
     *     };
     *   }
     *   
     *   // 否则标记为需要分析
     *   return {
     *     needsAnalysis: true,
     *     jdkVersion: null,
     *     compatible: null
     *   };
     * }
     */
    static async find(groupId: string, artifactId: string, version: string): Promise<GavJarInformation | undefined> {
        const id = this.buildId(groupId, artifactId, version);

        const transaction = Database.getDatabase().transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);
        const result = await objectStore.get(id); // 直接使用 await

        return result;
    }

    /**
     * 生成标准化ID（组合GAV参数）
     * 
     * 将Maven的GroupId、ArtifactId和Version参数组合为标准格式的唯一标识符
     * 用于在数据库中作为记录的主键（keyPath）
     * 
     * 格式规则：
     * - 三部分参数之间使用冒号(:)分隔
     * - 不做额外的空格处理和格式化
     * - 保持原始大小写
     * 
     * 注意事项：
     * - 输入参数须已预先验证，本方法不做有效性检查
     * - 参数区分大小写，相同坐标但大小写不同会被视为不同记录
     *
     * @param {string} groupId - 组织标识
     *                         - Maven Group ID，如"org.springframework"
     * 
     * @param {string} artifactId - 构件标识
     *                            - Maven Artifact ID，如"spring-core"
     * 
     * @param {string} version - 版本号
     *                         - Maven Version，如"5.3.20"
     * 
     * @returns {string} 格式为 groupId:artifactId:version 的字符串
     *                  该字符串将作为数据库主键使用
     *
     * @example
     * // 基本用法
     * const id1 = GavJarInformationStorage.buildId('com.google', 'guava', '31.0');
     * console.log(id1); // 输出 'com.google:guava:31.0'
     * 
     * // 实际使用场景
     * const id2 = GavJarInformationStorage.buildId('org.springframework', 'spring-core', '5.3.20');
     * console.log(id2); // 输出 'org.springframework:spring-core:5.3.20'
     * 
     * // 作为数据库主键使用
     * data.id = GavJarInformationStorage.buildId(data.groupId, data.artifactId, data.version);
     */
    static buildId(groupId: string, artifactId: string, version: string): string {
        return `${groupId}:${artifactId}:${version}`;
    }
}