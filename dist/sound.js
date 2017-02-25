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
    exports.emitter.on("play-alert-sound", (params) => {
        if (params.id < 1 || params.id > 9)
            return;
        var volume;
        if (params.volume) {
            if (params.volume > 0 || params.volume <= 300)
                volume = params.volume / 300;
            else
                return;
        }
        else {
            volume = 100 / 300;
        }
        const audio = alertMapping.get(params.id);
        if (audio) {
            audio.volume = volume;
            audio.play();
        }
    });
}
exports.activate = activate;
function deactivate() {
    exports.emitter.clear();
}
exports.deactivate = deactivate;
