/**
 * 日志级别枚举
 * 
 * 用于定义日志的重要性等级，便于日志过滤和控制输出
 * 数字越小级别越低，数字越大级别越高
 * 
 * 包含四个级别：
 * - DEBUG: 调试信息，最低级别，用于开发调试
 * - INFO: 普通信息，默认级别，记录程序正常运行信息
 * - WARN: 警告信息，表示可能存在的潜在问题
 * - ERROR: 错误信息，最高级别，表示程序运行中的严重问题
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * 日志级别字符串类型
 * 
 * 表示LogLevel枚举中所有键的联合类型
 * 可用值: 'DEBUG', 'INFO', 'WARN', 'ERROR'
 */
export type LogLevelString = keyof typeof LogLevel;

/**
 * 日志级别数字类型
 * 
 * 表示LogLevel枚举中所有值的联合类型
 * 可用值: 0, 1, 2, 3
 */
export type LogLevelNumber = 0 | 1 | 2 | 3;

/**
 * 日志记录器类
 * 
 * 提供分级别的日志记录功能，支持自定义日志名称和日志级别
 * 所有日志信息将输出到浏览器控制台，并带有时间戳、日志器名称和级别标识
 * 
 * 特性：
 * - 支持四种日志级别：DEBUG、INFO、WARN、ERROR
 * - 每种级别使用不同颜色在控制台显示，便于区分
 * - 可动态调整日志级别，过滤低优先级日志
 * - 日志包含时间戳，便于追踪问题发生时间
 * 
 * 使用示例：
 * @example
 * // 创建自定义日志器
 * const myLogger = new Logger('MyModule');
 * 
 * // 设置日志级别
 * myLogger.setLevel(LogLevel.DEBUG);
 * 
 * // 记录各级别日志
 * myLogger.debug('调试信息');
 * myLogger.info('普通信息');
 * myLogger.warn('警告信息');
 * myLogger.error('错误信息', new Error('发生异常'));
 * 
 * // 使用预配置的默认日志器
 * import { logger } from './Logger';
 * logger.info('使用默认日志器');
 */
export class Logger {
    /**
     * 日志器名称
     * 
     * 用于区分不同模块的日志来源
     * 在日志输出时会显示为 [日志器名称]
     * 默认值为 "Logger"
     */
    private readonly name: string;
    
    /**
     * 当前日志级别
     * 
     * 控制哪些级别的日志会被输出
     * 只有级别大于等于此值的日志才会被记录
     * 默认值为 LogLevel.INFO (1)
     */
    private level: LogLevelNumber = LogLevel.INFO;
    
    /**
     * 可用日志级别映射表
     * 
     * 存储LogLevel枚举的引用
     * 主要用于内部字符串级别名称到数字值的转换
     */
    private readonly levels = LogLevel;

    /**
     * 创建日志记录器实例
     * 
     * @param {string} [name] - 日志器名称，用于标识日志来源
     *                          如果不提供，将使用默认名称 "Logger"
     *                          建议使用有意义的模块名称，如 "Database", "Network" 等
     * 
     * 使用示例：
     * @example
     * // 创建默认名称的日志器
     * const defaultLogger = new Logger();
     * 
     * // 创建自定义名称的日志器
     * const dbLogger = new Logger('Database');
     * const networkLogger = new Logger('NetworkModule');
     */
    constructor(name?: string) {
        this.name = name || "Logger";
    }

    /**
     * 设置日志级别
     * 
     * 用于动态调整日志过滤级别，只有大于等于设置级别的日志才会被输出
     * 支持使用字符串名称或数字值来设置级别
     * 
     * 性能影响：
     * - 设置较高的日志级别可以减少控制台输出，提高性能
     * - 在生产环境建议设置为 INFO 或更高级别
     * - 在开发环境可设置为 DEBUG 以获取最详细的日志
     *
     * @param {LogLevelString | LogLevelNumber} level - 要设置的日志级别
     *        可以是字符串：'DEBUG'|'INFO'|'WARN'|'ERROR'（不区分大小写）
     *        也可以是数字：0|1|2|3
     *        无效值将被设置为默认值 INFO(1)
     *        数字值会被限制在有效范围内(0-3)
     * 
     * 使用示例：
     * @example
     * // 使用字符串设置级别（不区分大小写）
     * logger.setLevel('debug');  // 设置为最低级别，输出所有日志
     * logger.setLevel('ERROR');  // 设置为最高级别，只输出错误日志
     *
     * // 使用数字设置级别
     * logger.setLevel(0);  // DEBUG级别
     * logger.setLevel(3);  // ERROR级别
     * 
     * // 无效值处理
     * logger.setLevel('INVALID');  // 将使用默认值 INFO
     * logger.setLevel(5);          // 将被限制为最高级别 ERROR(3)
     * logger.setLevel(-1);         // 将被限制为最低级别 DEBUG(0)
     */
    setLevel(level: LogLevelString | LogLevelNumber): void {
        if (typeof level === "string") {
            const normalized = level.toLowerCase() as LogLevelString;
            this.level = LogLevel[normalized] ?? LogLevel.INFO;
        } else {
            this.level = Math.min(Math.max(level, LogLevel.DEBUG), LogLevel.ERROR) as LogLevelNumber;
        }
    }

    /**
     * 记录调试级别日志
     * 
     * 用于记录详细的调试信息，如变量值、函数调用等
     * 通常仅在开发环境使用，生产环境应禁用以提高性能
     * 控制台中以灰色显示
     * 
     * @param {...any} messages - 要记录的调试信息，可以是任意类型，多个参数将被空格连接
     *                           支持对象、数组等复杂类型，控制台中可展开查看
     * 
     * 使用示例：
     * @example
     * // 记录简单调试信息
     * logger.debug('初始化完成');
     * 
     * // 记录带变量的调试信息
     * const count = 5;
     * logger.debug('处理了', count, '个项目');
     * 
     * // 记录对象信息
     * const user = { id: 1, name: 'admin' };
     * logger.debug('当前用户信息:', user);
     * 
     * // 记录多个参数
     * logger.debug('请求参数:', { url: '/api/data', method: 'GET' }, '响应状态:', 200);
     * 
     * 注意：只有当日志级别设置为 DEBUG(0) 时，这些日志才会输出
     */
    debug(...messages: any[]): void {
        this._log('DEBUG', 'color: #999;', ...messages);
    }

    /**
     * 记录信息级别日志
     * 
     * 用于记录程序正常运行的信息，如功能启动、任务完成等
     * 可在生产环境使用，记录重要的操作信息
     * 控制台中以蓝色显示
     * 
     * @param {...any} messages - 要记录的信息，可以是任意类型，多个参数将被空格连接
     *                           支持对象、数组等复杂类型，控制台中可展开查看
     * 
     * 使用示例：
     * @example
     * // 记录简单信息
     * logger.info('应用已启动');
     * 
     * // 记录带变量的信息
     * const version = '1.0.0';
     * logger.info('当前版本:', version);
     * 
     * // 记录操作结果
     * logger.info('数据加载完成，共', 100, '条记录');
     * 
     * // 记录复杂对象
     * logger.info('配置加载完成:', { theme: 'dark', language: 'zh_CN' });
     * 
     * 注意：当日志级别设置为 INFO(1) 或更低时，这些日志才会输出
     */
    info(...messages: any[]): void {
        this._log('INFO', 'color: #00f;', ...messages);
    }

    /**
     * 记录警告级别日志
     * 
     * 用于记录潜在问题或需要注意的情况，如参数不合理、性能降低等
     * 通常不会影响程序主要功能，但可能导致次要问题
     * 控制台中以橙色显示并加粗
     * 
     * @param {...any} messages - 要记录的警告信息，可以是任意类型，多个参数将被空格连接
     *                           支持对象、数组等复杂类型，控制台中可展开查看
     * 
     * 使用示例：
     * @example
     * // 记录简单警告
     * logger.warn('配置项已废弃，将在下个版本移除');
     * 
     * // 记录性能警告
     * logger.warn('操作耗时超过预期:', 1500, 'ms');
     * 
     * // 记录参数警告
     * function process(data: any) {
     *   if (!data) {
     *     logger.warn('收到空数据，使用默认值代替');
     *     data = {};
     *   }
     *   // 处理数据...
     * }
     * 
     * // 记录兼容性警告
     * if (isOldBrowser) {
     *   logger.warn('检测到旧版浏览器，部分功能可能不可用:', { 
     *     browser: 'IE', 
     *     version: 11 
     *   });
     * }
     * 
     * 注意：当日志级别设置为 WARN(2) 或更低时，这些日志才会输出
     */
    warn(...messages: any[]): void {
        this._log('WARN', 'color: #ffa500; font-weight: bold;', ...messages);
    }

    /**
     * 记录错误级别日志
     * 
     * 用于记录严重问题或错误，如异常、请求失败、功能无法使用等
     * 通常表示程序某部分功能已经无法正常工作
     * 控制台中以红色显示并加粗
     * 
     * @param {...any} messages - 要记录的错误信息，可以是任意类型，多个参数将被空格连接
     *                           支持Error对象、异常堆栈等，控制台中可展开查看
     * 
     * 使用示例：
     * @example
     * // 记录简单错误信息
     * logger.error('无法连接到服务器');
     * 
     * // 记录带错误码的信息
     * logger.error('请求失败，错误码:', 404);
     * 
     * // 记录异常对象
     * try {
     *   JSON.parse('{"invalid": json}');
     * } catch (e) {
     *   logger.error('解析JSON失败:', e);
     * }
     * 
     * // 记录详细错误信息
     * logger.error(
     *   '用户认证失败:',
     *   { userId: 'user123', reason: 'token expired' },
     *   new Error('Authentication failed')
     * );
     * 
     * 注意：
     * - 当日志级别设置为 ERROR(3) 或更低时，这些日志才会输出
     * - 通常错误级别的日志都应该得到关注和处理
     */
    error(...messages: any[]): void {
        this._log('ERROR', 'color: #f00; font-weight: bold;', ...messages);
    }

    /**
     * 内部日志处理方法
     * 
     * 负责根据当前设置的日志级别过滤日志，并格式化输出到控制台
     * 添加时间戳、日志器名称和级别标识，并应用样式
     * 
     * 工作流程：
     * 1. 检查日志级别是否应该被输出
     * 2. 格式化日志信息，添加元数据（时间戳、名称、级别）
     * 3. 使用控制台API输出带样式的日志
     * 
     * @param {keyof typeof LogLevel} level - 日志级别名称（大写格式），如'DEBUG'、'ERROR'
     * @param {string} style - 控制台输出CSS样式，用于设置颜色、字体粗细等
     * @param {...any} messages - 日志消息内容，可以是任意类型和数量的参数
     * 
     * 内部实现细节：
     * - 使用ISO格式的时间戳，精确到毫秒
     * - 使用console.log而非console.debug/info/warn/error以便统一样式控制
     * - 第一个参数使用%c标记应用CSS样式
     * 
     * 日志格式：[时间戳] [日志器名称] [级别] 消息内容
     * 
     * 注意：此方法仅供类内部使用，不应直接调用
     */
    private _log(level: keyof typeof LogLevel, style: string, ...messages: any[]): void {
        const levelValue = LogLevel[level];
        if (levelValue < this.level) return;

        const timestamp = new Date().toISOString();
        const formatted = [
            `%c[${timestamp}]`,   // 时间戳（带样式）
            `[${this.name}]`,     // 日志器名称
            `[${level}]`,         // 日志级别
            ...messages           // 用户日志内容
        ].join(" ");

        console.log(formatted, style);
    }
}

/**
 * 预配置的默认日志实例
 * 
 * 使用"mvnrepository-helper-UserScript"作为日志器名称的全局日志对象
 * 可在项目各模块中直接导入使用，无需创建新实例
 * 默认日志级别为INFO，可通过setLevel方法调整
 * 
 * 使用示例：
 * @example
 * import { logger } from "../logger/Logger";
 * 
 * // 直接使用
 * logger.info('组件已加载');
 * 
 * // 修改日志级别
 * logger.setLevel('debug');  // 开发环境
 * logger.setLevel('error');  // 生产环境
 * 
 * // 记录各类信息
 * logger.debug('调试数据:', { detail: 'value' });
 * logger.info('功能已初始化');
 * logger.warn('检测到性能问题');
 * logger.error('操作失败:', new Error('网络错误'));
 * 
 * @see Logger 完整的日志器类定义和方法说明
 */
export const logger = new Logger("mvnrepository-helper-UserScript");
