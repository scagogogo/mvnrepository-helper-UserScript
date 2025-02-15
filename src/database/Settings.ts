import Database from "./Database";

const NAME: string = "settings";
const ID: string = "settings";

export default class Settings {
    static STORE_NAME = NAME;
    static KEY = ID;

    id: string;
    concurrency: number;

    constructor(concurrency?: number) {
        this.id = Settings.KEY;
        this.concurrency = concurrency ?? 3;
    }

    /**
     * 保存设置到数据库（首次创建）
     *
     * @example
     * // 创建新配置并保存
     * const settings = new Settings();
     * await Settings.save(settings);
     *
     * @param settings - 要保存的配置对象实例
     * @returns Promise<void>
     */
    static async save(settings: Settings): Promise<void> {
        const transaction = Database.getDatabase().transaction([Settings.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(Settings.STORE_NAME);
        await objectStore.put(settings);
    }

    /**
     * 更新现有配置
     *
     * @example
     * // 更新并发数后保存
     * const settings = await Settings.findSettings();
     * settings.concurrency = 5;
     * await Settings.update(settings);
     *
     * @param settings - 要更新的配置对象实例
     * @returns Promise<void>
     */
    static async update(settings: Settings): Promise<void> {
        const transaction = Database.getDatabase().transaction([Settings.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(Settings.STORE_NAME);
        await objectStore.put(settings);
    }

    /**
     * 从数据库读取配置信息
     *
     * @example
     * // 获取配置信息
     * const settings = await Settings.findSettings();
     * console.log(settings.concurrency);
     *
     * @returns Promise<Settings> 返回配置对象实例
     */
    static async findSettings(): Promise<Settings> {
        const transaction = Database.getDatabase()
            .transaction([Settings.STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(Settings.STORE_NAME);
        const result = await objectStore.get(Settings.KEY); // 直接使用 await

        if (result) {
            return new Settings(result.concurrency);
        } else {
            throw new Error("Settings not found");
        }
    }

}