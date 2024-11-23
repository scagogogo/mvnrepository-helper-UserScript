// 存储解析到的Jar包的JDK编译版本

const {database} = require("./database");

const NAME = "gav-jar-jdk-version-storage";

/**
 * 保存
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param context
 */
async function save(groupId, artifactId, version, context) {

    const id = buildId(groupId, artifactId, version);
    context.groupId = groupId;
    context.artifactId = artifactId;
    context.version = version;
    const object = {id: id, context: context};

    const request = await database.transaction([NAME], "readwrite")
        .objectStore(NAME)
        .add(object);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };
}

/**
 * 读取
 *
 * @param groupId
 * @param artifactId
 * @param version
 */
function find(groupId, artifactId, version) {
    const id = buildId(groupId, artifactId, version);
    database.transaction([NAME], "readonly").objectStore(NAME).get(id);
}

/**
 * 生成数据库ID
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @returns {string}
 */
function buildId(groupId, artifactId, version) {
    return `${groupId}:${artifactId}:${version}`;
}
