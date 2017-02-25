"use strict";
const atom_1 = require("atom");
const path = require("path");
const soundPath = path.join(__dirname + "/../media/sounds");
exports.emitter = new atom_1.Emitter;
function setupAlertSounds(container) {
    for (var i = 1; i < 10; i++) {
        container.set(i, new Audio(path.join(soundPath, "/AlertSound_0" + i + ".mp3")));
    }
}
function activate() {
    const alertMapping = new Map();
    setupAlertSounds(alertMapping);
    exports.emitter.on('play-alert-sound', (id) => {
        if (id < 1 || id > 9)
            return;
        const audio = alertMapping.get(id);
        if (audio)
            audio.play();
    });
}
exports.activate = activate;
function deactivate() {
    exports.emitter.clear();
}
exports.deactivate = deactivate;
