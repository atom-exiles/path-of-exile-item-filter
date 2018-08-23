"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path = require("path");
const soundsFileData = require("../data/sounds.json");
const soundPath = path.join(`${__dirname}/../media/sounds`);
class SoundPlayer {
    constructor() {
        this.sounds = new Map();
        this.setupAlertSounds();
    }
    dispose() {
        this.sounds.clear();
    }
    playAlertSound(id, volume) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(this.sounds.get(id), `unknown sound ${id} passed to playAlertSound`);
            let adjustedVolume;
            if (volume) {
                assert(typeof volume === "number", "sound volume, if given, must be a number");
                assert(volume >= 0 && volume <= 300, "sound volume must be a value from 1 to 300");
                adjustedVolume = volume / 300;
            }
            else {
                adjustedVolume = 100 / 300;
            }
            const audio = this.sounds.get(id);
            if (audio) {
                audio.volume = adjustedVolume;
                yield audio.play();
            }
            else {
                throw new Error("valid ID had no associated HTMLAudioElement");
            }
            return;
        });
    }
    setupAlertSounds() {
        for (const i in soundsFileData) {
            const value = soundsFileData[i];
            if (!value)
                continue;
            this.sounds.set(i, new Audio(path.join(soundPath, value.filename)));
        }
        return;
    }
}
exports.SoundPlayer = SoundPlayer;
