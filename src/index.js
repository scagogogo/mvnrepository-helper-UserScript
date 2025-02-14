const {expandText} = require("./repo1/expand-text/expand-text");
require('current-script-polyfill');
const {addQuickJump} = require("./repo1/quick-jump/quick-jump");
const {initJarJdkVersion} = require("./mvnrepository/jar_version/jar-jdk-version");
const {initDatabase} = require("./database/database");
const {initRepoInformation} = require("./database/repo-information-storage");
const {FloatBallComponent} = require("./ui/FloatBallComponent");

(async () => {
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
            const floatBall = new FloatBallComponent({
                defaultConcurrency: 3,
                onSave: (value) => {
                    console.log('当前并发数更新为:', value);
                    // 这里可以接入实际业务逻辑
                }
            });

            // Java开发者都会用到的这个域名
            initJarJdkVersion();
            break;
    }
})();

