/**
 * 将text重复count次拼接为string返回
 *
 * @param text
 * @param count
 * @return {string}
 */
function repeat(text, count) {
    const buff = [];
    for (let i = 0; i < count; i++) {
        buff.push(text)
    }
    return buff.join("");
}

module.exports = {
    repeat
}