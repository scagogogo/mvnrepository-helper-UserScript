/**
 * 日志级别枚举
 *
 * 数字越小级别越低，数字越大级别越高
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export type LogLevelString = keyof typeof LogLevel;
export type LogLevelNumber = 0 | 1 | 2 | 3;

export class Logger {
    /** 日志器名称（用于区分不同模块的日志） */
    private readonly name: string;
    /** 当前日志级别（默认INFO级别） */
    private level: LogLevelNumber = LogLevel.INFO;
    /** 可用日志级别映射表 */
    private readonly levels = LogLevel;

    constructor(name?: string) {
        this.name = name || "Logger";
    }

    /**
     * 设置日志级别（支持字符串或数字）
     *
     * @example
     * // 使用字符串设置级别
     * logger.setLevel('debug');
     *
     * @example
     * // 使用数字设置级别
     * logger.setLevel(0);
     *
     * @param level - 级别值（'debug'|'info'|'warn'|'error' 或 0|1|2|3）
     */
    setLevel(level: LogLevelString | LogLevelNumber): void {
        if (typeof level === "string") {
            const normalized = level.toLowerCase() as LogLevelString;
            this.level = LogLevel[normalized] ?? LogLevel.INFO;
        } else {
            this.level = Math.min(Math.max(level, LogLevel.DEBUG), LogLevel.ERROR) as LogLevelNumber;
        }
    }

    debug(...messages: any[]): void {
        this._log('DEBUG', 'color: #999;', ...messages);
    }

    info(...messages: any[]): void {
        this._log('INFO', 'color: #00f;', ...messages);
    }

    warn(...messages: any[]): void {
        this._log('WARN', 'color: #ffa500; font-weight: bold;', ...messages);
    }

    error(...messages: any[]): void {
        this._log('ERROR', 'color: #f00; font-weight: bold;', ...messages);
    }

    /**
     * 内部日志处理方法
     *
     * @param level  - 日志级别（大写格式）
     * @param style  - 控制台输出样式
     * @param messages - 日志消息内容
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

// 预配置的默认日志实例（可直接使用）
export const logger = new Logger("mvnrepository-helper-UserScript");
