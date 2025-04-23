/**
 * Java 类文件解析工具类
 * 提供类文件名检查、字节码验证、版本解析等功能
 */
export default class ClassFileUtil {

    // Java 类文件的魔数（0xCAFEBABE）
    static readonly MAGIC_NUMBER: number = 0xCAFEBABE;

    // -----------------------------------------------------------------------------------------------------------------
    // 文件基础校验方法
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * 根据文件名判断是否是class文件
     * @example
     * ClassFileUtil.isClassFileName('Test.class')  // true
     * ClassFileUtil.isClassFileName('Test.java')   // false
     *
     * @param filename 需要检查的文件名（允许空值）
     * @returns 如果是.class文件扩展名返回true
     * 
     * 方法功能描述：
     * -----------
     * 通过检查文件名后缀判断文件是否为Java编译后的类文件（.class文件）。
     * 这是一个简单的字符串后缀匹配，不检查文件内容的有效性。
     * 
     * 判断逻辑：
     * - 检查文件名是否以".class"结尾（区分大小写）
     * - 对空值（null/undefined）安全处理，返回false
     * - 不验证文件是否存在或是否为有效的Java类文件
     * 
     * 使用场景：
     * - 文件过滤，仅处理.class文件
     * - JAR包内容遍历时筛选类文件
     * - 批处理前的文件类型预检查
     * 
     * 性能说明：
     * - O(1)时间复杂度，只检查字符串后缀
     * - 执行速度极快，适合大量文件的筛选
     * 
     * 参数详解：
     * - filename：文件名字符串，可能包含路径
     *   * 完整路径：检查最后一个组成部分（如"/path/to/MyClass.class"返回true）
     *   * 仅文件名：正常检查后缀（如"MyClass.class"返回true）
     *   * null/undefined：安全处理返回false
     *   * 空字符串：返回false
     *   * 大小写敏感：".CLASS"或".Class"后缀将返回false
     * 
     * 边界情况：
     * - ".class"作为整个文件名返回true
     * - 仅有后缀无文件名如".class"返回true
     * - 空字符串返回false
     * - null/undefined返回false
     * 
     * 使用示例：
     * @example
     * // 基本使用
     * if (ClassFileUtil.isClassFileName("MyClass.class")) {
     *   console.log("这是一个类文件");
     * }
     * 
     * @example
     * // 在文件数组中过滤出类文件
     * const fileList = ["A.java", "B.class", "C.txt", "D.class"];
     * const classFiles = fileList.filter(file => ClassFileUtil.isClassFileName(file));
     * console.log(classFiles); // 输出: ["B.class", "D.class"]
     * 
     * @example
     * // 安全处理null值
     * let fileName = null;
     * const isClass = ClassFileUtil.isClassFileName(fileName); // 返回false，不会抛出异常
     */
    static isClassFileName(filename: string | null | undefined): boolean {
        return !!filename && filename.endsWith(".class");
    }

    /**
     * 通过字节码验证是否是合法的class文件
     * @example
     * const validHeader = [0xCA, 0xFE, 0xBA, 0xBE, 0x00, ...更多字节];
     * ClassFileUtil.isClassFileBytes(validHeader)  // true
     *
     * @param classBytes 类文件的字节数组（需要至少4字节长度）
     * @returns 如果前4字节等于JVM魔数返回true
     * 
     * 方法功能描述：
     * -----------
     * 通过检查类文件字节数组的头4个字节是否为Java类文件魔数(0xCAFEBABE)来验证文件的有效性。
     * 这是识别Java类文件的标准方法，比仅检查文件后缀更可靠。
     * 
     * 验证机制：
     * - 读取字节数组前4个字节
     * - 将这4个字节组合为一个32位整数
     * - 与Java类文件魔数常量(0xCAFEBABE)比较
     * - 完全匹配则认为是合法的类文件头部
     * 
     * 技术细节：
     * - 按大端序(Big-Endian)处理字节序列
     * - 通过位移和位或操作组合4个字节为一个整数
     * - 不检查文件格式的其他部分（如常量池、字段表等）
     * 
     * 应用场景：
     * - 验证下载或提取的字节数组是否为有效类文件
     * - JAR文件分析工具中检查条目有效性
     * - 避免处理损坏或非类文件的数据
     * 
     * 性能特点：
     * - 仅检查文件头部，O(1)复杂度
     * - 不需要读取整个文件，适合大文件初步检查
     * 
     * 参数详解：
     * - classBytes：类文件的字节数组
     *   * 必须至少包含4个字节
     *   * 字节值应为0-255之间的整数
     *   * 通常从文件读取或网络接收
     *   * 有效的Java类文件开始字节应为[0xCA, 0xFE, 0xBA, 0xBE]
     * 
     * 边界情况处理：
     * - 数组长度小于4：直接返回false，不会抛出异常
     * - 无效的字节值：可能导致计算错误，方法不做专门检查
     * 
     * 异常处理：
     * - 不抛出异常，对短数组安全返回false
     * - 对null参数会导致运行时错误，调用方需确保传入有效数组
     * 
     * 使用示例：
     * @example
     * // 1. 读取文件字节并验证
     * const fileBytes = [0xCA, 0xFE, 0xBA, 0xBE, 0x00, 0x00, 0x00, 0x37, ...]; 
     * if (ClassFileUtil.isClassFileBytes(fileBytes)) {
     *   console.log("这是一个有效的Java类文件");
     * }
     * 
     * @example
     * // 2. 处理不同类型的字节数组
     * const invalidBytes = [0x50, 0x4B, 0x03, 0x04]; // ZIP文件头部
     * console.log(ClassFileUtil.isClassFileBytes(invalidBytes)); // 输出: false
     * 
     * @example
     * // 3. 处理边界情况
     * const tooShortBytes = [0xCA, 0xFE, 0xBA]; // 只有3个字节
     * console.log(ClassFileUtil.isClassFileBytes(tooShortBytes)); // 输出: false
     * 
     * @see MAGIC_NUMBER 类的静态常量，定义了Java类文件的魔数
     */
    static isClassFileBytes(classBytes: number[]): boolean {
        if (classBytes.length < 4) return false;
        return (
            (classBytes[0] << 24) |
            (classBytes[1] << 16) |
            (classBytes[2] << 8) |
            classBytes[3]
        ) === ClassFileUtil.MAGIC_NUMBER;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // 版本解析相关方法
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * 解析类文件的主次版本号
     * @example
     * const bytes = [0xCA,0xFE,0xBA,0xBE, 0x00,0x00, 0x00,0x34];
     * parseClassFileVersion(bytes) // { majorVersion: 52, minorVersion: 0 }
     *
     * @param classBytes 类文件字节数组（需要至少8字节长度）
     * @returns 包含主版本号(majorVersion)和次版本号(minorVersion)的对象
     * 
     * 方法功能描述：
     * -----------
     * 从Java类文件字节数组中解析出编译该类文件时使用的JDK版本信息（主版本号和次版本号）。
     * 该方法遵循Java类文件格式规范，从指定位置读取版本信息字节并转换为对应的数值。
     * 
     * 解析原理：
     * - Java类文件结构中，版本信息位于魔数(CAFEBABE)之后
     * - 次版本号(minor_version)在第5-6字节
     * - 主版本号(major_version)在第7-8字节
     * - 按大端序(Big-Endian)解析两个无符号16位整数
     * 
     * 版本映射规则：
     * - Java版本与主版本号对应关系：主版本号 = Java版本 + 44（Java 8以前）
     * - 如Java 8对应主版本号52，Java 11对应主版本号55
     * - 次版本号通常为0，除非是预览版或特殊版本
     * 
     * 应用场景：
     * - 检测JAR包兼容的JDK版本
     * - 分析类文件兼容性问题
     * - 统计项目使用的Java编译器版本
     * 
     * 性能特点：
     * - O(1)常量时间复杂度
     * - 仅读取文件头部，不需处理整个类文件
     * 
     * 参数详解：
     * - classBytes：类文件的字节数组
     *   * 必须至少包含8个字节
     *   * 前4字节应为Java魔数(0xCAFEBABE)
     *   * 按字节顺序为[魔数4字节, 次版本号2字节, 主版本号2字节, ...]
     *   * 通常从.class文件读取或从JAR包中提取
     * 
     * 返回值详解：
     * - 包含两个属性的对象：
     *   * majorVersion：主版本号(Java主版本)，如52表示Java 8
     *   * minorVersion：次版本号，通常为0
     *   * 示例：{majorVersion: 55, minorVersion: 0} 表示Java 11
     * 
     * 边界情况处理：
     * - 数组长度不足：未经检查，可能导致undefined访问
     * - 数组为null：会导致运行时错误
     * - 无效类文件：可能解析出无意义的版本号
     * 
     * 异常处理：
     * - 不进行显式异常处理，调用方需确保参数有效
     * - 对无效输入不保证输出正确性，调用前应先验证类文件有效性
     * 
     * 使用示例：
     * @example
     * // 1. 解析类文件版本
     * const fileBytes = [0xCA, 0xFE, 0xBA, 0xBE, 0x00, 0x00, 0x00, 0x34, ...]; // Java 8
     * const version = ClassFileUtil.parseClassFileVersion(fileBytes);
     * console.log(`该类文件由Java ${version.majorVersion - 44}编译`); 
     * // 输出: "该类文件由Java 8编译"
     * 
     * @example
     * // 2. 检查类文件兼容性
     * function isCompatibleWithJDK8(classBytes) {
     *   if (!ClassFileUtil.isClassFileBytes(classBytes)) return false;
     *   const version = ClassFileUtil.parseClassFileVersion(classBytes);
     *   return version.majorVersion <= 52; // JDK 8 or lower
     * }
     * 
     * @example
     * // 3. 获取人类可读的版本描述
     * const bytes = [0xCA, 0xFE, 0xBA, 0xBE, 0x00, 0x00, 0x00, 0x37]; // Java 17
     * const version = ClassFileUtil.parseClassFileVersion(bytes);
     * const readableVersion = ClassFileUtil.jdkVersionToHumanReadableString(
     *   version.majorVersion, 
     *   version.minorVersion
     * );
     * console.log(readableVersion); // 输出: "JDK 17"
     * 
     * @see jdkVersionToHumanReadableString 将版本号转换为可读字符串的方法
     */
    static parseClassFileVersion(classBytes: number[]): { majorVersion: number; minorVersion: number } {
        // 主版本号和次版本号分别位于第 5-6 和 7-8 字节（0-based索引）
        const minorVersion = (classBytes[4] << 8) | classBytes[5];
        const majorVersion = (classBytes[6] << 8) | classBytes[7];
        return {majorVersion, minorVersion};
    }

    /**
     * 将数值版本号转换为人类可读的JDK版本字符串
     * @example
     * jdkVersionToHumanReadableString(51, 0)  // 'JDK 1.7'
     * jdkVersionToHumanReadableString(55, 3)  // 'JDK 11.3'
     *
     * @param majorVersion 主版本号（来自类文件）
     * @param minorVersion 次版本号（来自类文件）
     * @returns 易读的JDK版本描述字符串
     * 
     * 方法功能描述：
     * -----------
     * 将Java类文件的主次版本号转换为人类可读的JDK版本字符串表示。
     * 该方法根据Java版本历史，将数字版本号映射为标准JDK版本名称。
     * 
     * 版本映射规则：
     * - 早期版本(Java 8之前)：使用"JDK 1.x"格式，如JDK 1.7
     * - Java 9及以后：使用"JDK x"格式，如JDK 11
     * - 带有次版本号的特殊版本：以"JDK x.y"格式显示，如JDK 11.3
     * 
     * 覆盖版本范围：
     * - 最早支持JDK 1.1（主版本号45）
     * - 支持所有已知JDK版本，包括最新的JDK 17+
     * - 对未知版本提供格式化错误信息
     * 
     * 功能特点：
     * - 自动识别早期版本和现代版本的不同命名规则
     * - 仅在次版本号非零时才显示，符合Java命名习惯
     * - 对未知版本提供清晰的错误信息，不会抛出异常
     * 
     * 应用场景：
     * - 在UI界面上显示JAR包的JDK兼容性信息
     * - 生成可读的依赖分析报告
     * - 输出人类友好的版本检测结果
     * 
     * 参数详解：
     * - majorVersion：主版本号
     *   * 常见值范围：45-67（对应JDK 1.1到JDK 23）
     *   * 历史重要节点：52=Java 8, 55=Java 11, 61=Java 17
     *   * 必须是整数，非法值将返回未知版本信息
     * 
     * - minorVersion：次版本号
     *   * 通常为0
     *   * 非零值通常表示预览版或特殊版本
     *   * 必须是整数
     * 
     * 返回值详解：
     * - 返回格式化的版本字符串，如"JDK 1.8"或"JDK 11"
     * - 当次版本号非零时，以点号连接，如"JDK 11.2"
     * - 对未知版本返回"Unknown JDK version XX"
     * 
     * 使用示例：
     * @example
     * // 1. 基本使用 - Java 8
     * const jdkString = ClassFileUtil.jdkVersionToHumanReadableString(52, 0);
     * console.log(jdkString); // 输出: "JDK 1.8"
     * 
     * @example
     * // 2. 现代Java版本 - Java 11
     * const jdkString = ClassFileUtil.jdkVersionToHumanReadableString(55, 0);
     * console.log(jdkString); // 输出: "JDK 11"
     * 
     * @example
     * // 3. 带次版本号 - 假设的Java 17.2版本
     * const jdkString = ClassFileUtil.jdkVersionToHumanReadableString(61, 2);
     * console.log(jdkString); // 输出: "JDK 17.2"
     * 
     * @example
     * // 4. 与版本解析结合使用
     * function getReadableJavaVersion(classBytes) {
     *   if (!ClassFileUtil.isClassFileBytes(classBytes)) {
     *     return "不是有效的类文件";
     *   }
     *   const version = ClassFileUtil.parseClassFileVersion(classBytes);
     *   return ClassFileUtil.jdkVersionToHumanReadableString(
     *     version.majorVersion,
     *     version.minorVersion
     *   );
     * }
     * 
     * @see parseClassFileVersion 用于从类文件字节中提取版本号的方法
     */
    static jdkVersionToHumanReadableString(majorVersion: number, minorVersion: number): string {
        let jdkVersion: string;
        switch (majorVersion) {
            case 45:
                jdkVersion = 'JDK 1.1';
                break;    // 45.3 对应 1.1.3
            case 46:
                jdkVersion = 'JDK 1.2';
                break;    // 46.0 对应 1.2.0
            case 47:
                jdkVersion = 'JDK 1.3';
                break;
            case 48:
                jdkVersion = 'JDK 1.4';
                break;
            case 49:
                jdkVersion = 'JDK 1.5';
                break;    // Java 5 开始版本号变更
            case 50:
                jdkVersion = 'JDK 1.6';
                break;
            case 51:
                jdkVersion = 'JDK 1.7';
                break;
            case 52:
                jdkVersion = 'JDK 1.8';
                break;   // Java 8长期支持版
            case 53:
                jdkVersion = 'JDK 9';
                break;      // 开始按主版本号直接命名
            case 54:
                jdkVersion = 'JDK 10';
                break;
            case 55:
                jdkVersion = 'JDK 11';
                break;     // LTS版本
            case 56:
                jdkVersion = 'JDK 12';
                break;
            case 57:
                jdkVersion = 'JDK 13';
                break;
            case 58:
                jdkVersion = 'JDK 14';
                break;
            case 59:
                jdkVersion = 'JDK 15';
                break;
            case 60:
                jdkVersion = 'JDK 16';
                break;
            case 61:
                jdkVersion = 'JDK 17';
                break;     // LTS版本
            case 62:
                jdkVersion = 'JDK 18';
                break;
            case 63:
                jdkVersion = 'JDK 19';
                break;
            case 64:
                jdkVersion = 'JDK 20';
                break;
            case 65:
                jdkVersion = 'JDK 21';
                break;     // 最新LTS版本（截至2023）
            case 66:
                jdkVersion = 'JDK 22';
                break;
            case 67:
                jdkVersion = 'JDK 23';
                break;
            case 68:
                jdkVersion = 'JDK 24';
                break;
            // TODO 2024-11-23 23:24:03 JDK迭代新版本时在此处增加
            // 版本号参考：https://javaalmanac.io/bytecode/versions/
            default:
                jdkVersion = `Unknown JDK version ${majorVersion}`;
        }

        // 仅当次版本号非零时显示（适用于旧版本号规范）
        return minorVersion ? `${jdkVersion}.${minorVersion}` : jdkVersion;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // 注意：原模块导出方法已整合到类的静态方法中，使用方式示例：
    // import { ClassFileUtil } from './class-util';
    // const isClass = ClassFileUtil.isClassFileName('Demo.class');
}