import 'current-script-polyfill';
import Settings from "../database/Settings";
import ExpandTextUtil from "../repo1/expand-text/ExpandTextUtil";
import QuickJumpManager from "../repo1/quick-jump/QuickJumpManager";
import {RepoInformationStorage} from "../database/RepoInformationStorage";
import FloatBallComponent from "../mvnrepository/jar_version/ui/FloatBallComponent";
import JarJdkVersionInitializer from "../mvnrepository/jar_version/JarJdkVersionInitializer";
import Database from "../database/Database";
import {logger, LogLevel} from "../logger/Logger";

/**
 * 初始化应用
 */
export default class AppInitializer {
    /**
     * 初始化方法
     */
    static async init(): Promise<void> {

        // TODO 开发的时候把日志设置为debug级别
        logger.setLevel(LogLevel.DEBUG);

        // 根据不同的域名启用不同的逻辑
        switch (window.location.hostname) {
            case 'repo1.maven.org':
                // 在下载页面，一般是为了开发SCA类应用才会重点关注这个域名
                ExpandTextUtil.expandText();
                QuickJumpManager.addQuickJump();
                break;
            case 'mvnrepository.com':
                // 仅仅在mvnrepository这个域名下需要创建数据库，避免在乱七八糟的域名下创建此数据库
                await Database.initDatabase();
                await RepoInformationStorage.init();

                // 展示设置的悬浮球
                const settings = await Settings.findSettings() ?? new Settings();
                const floatBall = new FloatBallComponent({
                    defaultConcurrency: settings.concurrency || 3,
                    onSave: (value: number) => {
                        const newSettings = new Settings();
                        newSettings.concurrency = value;
                        Settings.save(newSettings);
                    }
                });

                // Java开发者都会用到的这个域名
                await JarJdkVersionInitializer.initJarJdkVersion();
                break;
        }
    }
}