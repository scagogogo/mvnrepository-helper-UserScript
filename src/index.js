const {expandText} = require("./repo1/expand-text/expand-text");
require('current-script-polyfill');
const {addQuickJump} = require("./repo1/quick-jump/quick-jump");
const {addJdkVersionColumn} = require("./mvnrepository/jar_version/jar_version");

switch (window.location.hostname) {
    case 'repo1.maven.org':
        expandText();
        addQuickJump();
        break;
    case 'mvnrepository.com':
        addJdkVersionColumn();
        break;
}


