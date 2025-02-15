require('current-script-polyfill');
const {expandText} = require("../repo1/expand-text/expand-text");
const {addQuickJump} = require("../repo1/quick-jump/quick-jump");
const {initDatabase} = require("../database/database");
const {initRepoInformation} = require("../database/repo-information-storage");
const {findSettings, Settings, saveSettings} = require("../database/Settings");
const {FloatBallComponent} = require("../ui/FloatBallComponent");
const {initJarJdkVersion} = require("../mvnrepository/jar_version/jar-jdk-version");

async function init() {
    // 根据不同的域名启用不同的逻辑
    switch (window.location.hostname) {
        case 'repo1.maven.org':
            // 在下载页面，一般是为了开发SCA类应用才会重点关注这个域名
            expandText();
            addQuickJump();
            break;
        case 'mvnrepository.com':
            // 仅仅在mvnrepository这个域名下需要创建数据库，避免在乱七八糟的域名下创建此数据库
            await initDatabase();
            await initRepoInformation();

            // 展示设置的悬浮球
            const settings = await findSettings() || new Settings();
            const floatBall = new FloatBallComponent({
                defaultConcurrency: settings.concurrency || 3,
                onSave: (value) => {
                    const settings = new Settings();
                    settings.concurrency = value;
                    saveSettings(settings);
                }
            });

            // Java开发者都会用到的这个域名
            initJarJdkVersion();
            break;
    }
}

module.exports = {
    init,
}

