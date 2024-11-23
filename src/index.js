const {expandText} = require("./repo1/expand-text/expand-text");
require('current-script-polyfill');
const {addQuickJump} = require("./repo1/quick-jump/quick-jump");
const {initJarJdkVersion} = require("./mvnrepository/jar_version/jar-jdk-version");

(async () => {
    // 根据不同的域名启用不同的逻辑
    switch (window.location.hostname) {
        case 'repo1.maven.org':
            // 在下载页面，一般是为了开发SCA类应用才会重点关注这个域名
            expandText();
            addQuickJump();
            break;
        case 'mvnrepository.com':
            // Java开发者都会用到的这个域名
            initJarJdkVersion();
            break;
    }
})();

