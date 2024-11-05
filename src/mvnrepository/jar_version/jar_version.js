const {randomId} = require("../../utils/id-util");
const JSZip = require("jszip");

/**
 * 修改页面的表格，加一列jdk的版本
 */
function addJdkVersionColumn() {

    const table = $('.gridcontainer table.versions');

    // 增加表头
    addTableHeader(table);

    // 遍历每一行，开始读取解析
    addTableCell(table);

}

function addTableCell(tableElt) {

    const {groupId, artifactId} = parseGroupIdAndArtifactId();

    // TODO 增加一个缓存，解析过一次的就不需要再重复解析了
    $(tableElt).find('tbody tr td').each((index, element) => {
        const versionLink = $(element).find('.release');
        if (versionLink.length !== 1) {
            return;
        }
        const version = versionLink.text();
        const id = randomId();
        $(element).after(() => {
            return '<td id="${id}">解析中...</td>';
        });
        resolveJdkVersion(groupId, artifactId, version, id);
    });


}

/**
 * 根据gav解析jdk版本
 *
 * @param groupId
 * @param artifactId
 * @param version
 * @param id
 */
function resolveJdkVersion(groupId, artifactId, version, id) {
    const jarUrl = buildJarUrl(groupId, artifactId, version);
    // 使用GM_xmlhttpRequest下载JAR文件
    GM_xmlhttpRequest({
        method: "GET",
        url: jarUrl,
        responseType: "arraybuffer",
        onload: function (response) {
            if (response.status === 200) {
                // 假设 this.response 是从某个来源（如 AJAX 请求）获取的 ZIP 文件的 ArrayBuffer 数据
                JSZip.loadAsync(this.response).then(function (zip) {
                    debugger;
                    // 获取 'META-INF/MANIFEST.MF' 文件的内容
                    const manifest = zip.file('META-INF/MANIFEST.MF');
                    if (manifest) {
                        // TODO 2024-11-05 08:49:20 这狗比好像是WebWorker实现的？油猴不支持收不到解压结果 
                        return manifest.async("string");
                    }  else {
                        return null;
                    }
                }).then(function (data) {
                    debugger;
                    if (data) {
                        const lines = data.split('\n');
                        lines.forEach(function (line) {
                            if (line.startsWith('Created-By:')) {
                                const jdkVersion = line.substring('Created-By:'.length).trim();
                                console.log('JDK Version:', jdkVersion);
                                // 假设你有一个元素的 ID 是 'jdkVersionDisplay'
                                document.getElementById('jdkVersionDisplay').textContent = jdkVersion;
                            }
                        });
                    }
                }).catch(function (e) {
                    debugger;
                    console.error('Error reading ZIP file:', e);
                });
            }
        },
        onerror: function (response) {
            console.error('Failed to download JAR:', response);
        }
    });
}

/**
 * 解析页面中的GroupId和ArtifactId
 *
 * @returns {{groupId: null, artifactId: null}}
 */
function parseGroupIdAndArtifactId() {

    let groupId = null;
    let artifactId = null;

    const split = $('.breadcrumb').text().split(' » ');
    if (split.length >= 2) {
        groupId = split[1].trim();
    }
    if (split.length >= 3) {
        artifactId = split[2].trim();
    }

    return {
        groupId,
        artifactId
    }
}

function addTableHeader(tableElt) {
    const header = `<th align="center">Build JDK Version</th>`;
    $(tableElt).find('thead tr th:contains("Version")').after(() => header);
}

function buildJarUrl(groupId, artifactId, version) {
    // TODO
    return `https://repo1.maven.org/maven2/${groupId.replaceAll('.', '/')}/${artifactId}/${version}/${artifactId}-${version}.jar`
}

module.exports = {
    addJdkVersionColumn
}

