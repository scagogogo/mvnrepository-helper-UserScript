// Java 类文件的魔数（0xCAFEBABE）
const MAGIC_NUMBER = 0xCAFEBABE;

/**
 * 根据文件名判断是否是class文件
 *
 * @param filename
 */
function isClassFileName(filename) {
    return filename && filename.endsWith(".class");
}

/**
 * 判断字节码是否是有效的字节码文件
 *
 * @param classBytes
 * @returns {boolean}
 */
function isClassFileBytes(classBytes) {
    // 检查字节数组长度是否至少为4，因为我们需要读取前4个字节来验证魔数
    if (classBytes.length < 4) {
        return false;
    }
    // 计算传入字节数组的前4个字节的值，并与魔数进行比较
    return (classBytes[0] << 24) + (classBytes[1] << 16) + (classBytes[2] << 8) + classBytes[3] === MAGIC_NUMBER;
}

/**
 * 解析字节码中的主版本号和次版本号
 *
 * @param classBytes
 * @returns {{minorVersion: number, majorVersion: number}}
 */
function parseClassFileVersion(classBytes) {
    // 主版本号和次版本号分别位于第 7 和第 8 个字节
    const minorVersion = classBytes[4] << 8 | classBytes[5];
    const majorVersion = classBytes[6] << 8 | classBytes[7];
    return {
        majorVersion,
        minorVersion,
    }
}

/**
 * 转为人类阅读友好格式
 *
 * @param majorVersion
 * @param minorVersion
 * @returns {string}
 */
function jdkVersionToHumanReadableString(majorVersion, minorVersion) {
    // 根据主版本号和次版本号推断 JDK 版本
    let jdkVersion;
    switch (majorVersion) {
        case 45: // JDK 1.1
            jdkVersion = 'JDK 1.1';
            break;
        case 46: // JDK 1.2
            jdkVersion = 'JDK 1.2';
            break;
        case 47: // JDK 1.3
            jdkVersion = 'JDK 1.3';
            break;
        case 48: // JDK 1.4
            jdkVersion = 'JDK 1.4';
            break;
        case 49: // JDK 1.5
            jdkVersion = 'JDK 1.5';
            break;
        case 50: // JDK 1.6
            jdkVersion = 'JDK 1.6';
            break;
        case 51: // JDK 1.7
            jdkVersion = 'JDK 1.7';
            break;
        case 52: // JDK 1.8
            jdkVersion = 'JDK 1.8';
            break;
        case 53: // JDK 9
            jdkVersion = 'JDK 9';
            break;
        case 54: // JDK 10
            jdkVersion = 'JDK 10';
            break;
        case 55: // JDK 11
            jdkVersion = 'JDK 11';
            break;
        case 56: // JDK 12
            jdkVersion = 'JDK 12';
            break;
        case 57: // JDK 13
            jdkVersion = 'JDK 13';
            break;
        case 58: // JDK 14
            jdkVersion = 'JDK 14';
            break;
        case 59: // JDK 15
            jdkVersion = 'JDK 15';
            break;
        case 60: // JDK 16
            jdkVersion = 'JDK 16';
            break;
        case 61: // JDK 17
            jdkVersion = 'JDK 17';
            break;
        case 62: // JDK 18
            jdkVersion = 'JDK 18';
            break;
        case 63: // JDK 19
            jdkVersion = 'JDK 19';
            break;
        case 64: // JDK 20
            jdkVersion = 'JDK 20';
            break;
        case 65: // JDK 21
            jdkVersion = 'JDK 21';
            break;
        case 66: // JDK 22
            jdkVersion = 'JDK 22';
            break;
        case 67: // JDK 23
            jdkVersion = 'JDK 23';
            break;
        case 68: // JDK 24
            jdkVersion = 'JDK 24';
            break;
        // TODO 2024-11-23 23:24:03 JDK迭代新版本的时候在此处增加
        // https://javaalmanac.io/bytecode/versions/
        default:
            jdkVersion = `Unknown JDK version ${majorVersion}`;
    }

    return minorVersion ? `${jdkVersion}.${minorVersion}` : jdkVersion;
}

module.exports = {
    parseClassFileVersion,
    jdkVersionToHumanReadableString,
    isClassFileBytes,
    isClassFileName,
}
