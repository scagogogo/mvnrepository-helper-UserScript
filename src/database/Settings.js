const {Database} = require("./Database");

const NAME = "settings";

const ID = "settings";

class Settings {

    constructor() {
        this.id = ID;
        this.concurrency = 3;
    }

}

/**
 *
 * @param settings {Settings}
 * @returns {Promise<void>}
 */
async function saveSettings(settings) {

    const request = await Database.getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(settings);

    request.onsuccess = function (event) {
        console.log("Data added to the database successfully");
    };

    request.onerror = function (event) {
        console.log("Error adding data: ", event.target.error);
    };
}

/**
 *
 * @param {Settings} settings
 */
async function updateSettings(settings) {

    const request = await Database.getDatabase().transaction([NAME], "readwrite")
        .objectStore(NAME)
        .put(settings);

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
 */
async function findSettings() {
    return await Database.getDatabase().transaction([NAME], "readonly").objectStore(NAME).get(ID);
}

module.exports = {
    Settings,
    findSettings,
    saveSettings,
    updateSettings
}