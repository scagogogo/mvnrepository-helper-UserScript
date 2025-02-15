async function sleep(mils) {
    return new Promise(resolve => setTimeout(resolve, mils));
}

module.exports = {
    sleep
}