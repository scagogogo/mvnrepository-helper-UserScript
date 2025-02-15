class Logger {

    constructor(name) {
        this.name = name || "Logger";
        this.levels = {debug: 0, info: 1, warn: 2, error: 3};
    }

    // 设置日志级别（支持字符串或数字）
    setLevel(level) {
        if (typeof level === "string") {
            this.level = this.levels[level.toLowerCase()] || 1; // 默认 info
        } else {
            this.level = Math.min(Math.max(level, 0), 3);
        }
    }

    // 新增 debug 级别
    debug(...messages) {
        this._log("debug", "color: gray;", ...messages);
    }

    info(...messages) {
        this._log("info", "color: blue;", ...messages);
    }

    warn(...messages) {
        this._log("warn", "color: orange;", ...messages);
    }

    error(...messages) {
        this._log("error", "color: red;", ...messages);
        if (typeof GM_notification !== "undefined") {
            GM_notification({
                text: messages.join(" "),
                title: `Error: ${this.name}`,
                image: "https://icons8.com/icon/78517/error",
            });
        }
    }

    _log(level, style, ...messages) {
        const levelWeight = this.levels[level];
        if (levelWeight < this.level) return; // 过滤低级别日志

        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${this.name}] [${level.toUpperCase()}]: ${messages.join(" ")}`;

        console.log(`%c${logMessage}`, style);
    }

}

// // 使用示例
// const logger = new Logger("MyScript");
// logger.debug("Debug message"); // 仅在级别为 debug 时显示
// logger.info("Info message");   // 在级别 >= info 时显示

const logger = new Logger("mvnrepository-helper-UserScript");

module.exports = {
    Logger,
    logger,
}