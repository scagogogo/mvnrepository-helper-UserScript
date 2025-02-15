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