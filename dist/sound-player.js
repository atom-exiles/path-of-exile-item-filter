"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const assert = require("assert");
const soundPath = path.join(__dirname + '/../media/sounds');
class SoundPlayer {
    constructor(jsonData) {
        this.sounds = new Map;
        jsonData.data.then((data) => {
            this.setupAlertSounds(data);
        });
    }
    dispose() {
        this.sounds.clear();
        return;
    }
    playAlertSound(id, volume) {
        assert(this.sounds.get(id), "unknown sound " + id + " passed to playAlertSound");
        if (volume) {
            assert(typeof volume === 'number', 'sound volume, if given, must be a number');
            assert(volume >= 0 && volume <= 300, 'sound volume must be a value from 1 to 300');
            var adjustedVolume = volume / 300;
        }
        else {
            var adjustedVolume = 100 / 300;
        }
        const audio = this.sounds.get(id);
        if (audio) {
            audio.volume = adjustedVolume;
            audio.play();
        }
        else {
            throw new Error("valid ID had no associated HTMLAudioElement");
        }
        return;
    }
    setupAlertSounds(data) {
        for (var i in data.sounds) {
            const value = data.sounds[i];
            if (!value)
                continue;
            this.sounds.set(i, new Audio(path.join(soundPath, value.filename)));
        }
        return;
    }
}
exports.SoundPlayer = SoundPlayer;
