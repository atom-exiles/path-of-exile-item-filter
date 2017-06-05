"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const assert = require("assert");
const soundPath = path.join(__dirname + '/../media/sounds');
class SoundPlayer {
    constructor() {
        this.sounds = new Map;
        this.setupAlertSounds();
    }
    dispose() {
        this.sounds.clear();
        return;
    }
    playAlertSound(id, volume) {
        assert(typeof id === 'number', 'sound identifier missing for playAlertSound');
        assert(id >= 1 && id <= 9, 'sound identifier must be a value from 1 to 9');
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
    setupAlertSounds() {
        for (var i = 1; i < 10; i++) {
            this.sounds.set(i, new Audio(path.join(soundPath, '/AlertSound_0' + i + '.mp3')));
        }
        return;
    }
}
exports.default = SoundPlayer;
