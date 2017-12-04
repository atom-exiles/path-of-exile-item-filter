import * as assert from "assert";
import * as path from "path";

import soundsFileData = require("../data/sounds.json");
const soundPath = path.join(`${__dirname}/../media/sounds`);

export class SoundPlayer {
  private readonly sounds: Map<string, HTMLAudioElement>;

  constructor() {
    this.sounds = new Map();
    this.setupAlertSounds();
  }

  dispose() {
    this.sounds.clear();
  }

  /**
   * Play the alert sound associated with the given ID. Optionally, play the alert
   * at the given volume level. The volume level should be a number from 0 to 300.
   */
  async playAlertSound(id: string, volume?: number) {
    assert(this.sounds.get(id), `unknown sound ${id} passed to playAlertSound`);

    // Path of Exile uses a range of 0 to 300 to determine volume, with 300
    // equating to 100% volume on the source.
    let adjustedVolume: number;
    if (volume) {
      assert(typeof volume === "number", "sound volume, if given, must be a number");
      assert(volume >= 0 && volume <= 300, "sound volume must be a value from 1 to 300");

      adjustedVolume = volume / 300;
    } else {
      adjustedVolume = 100 / 300;
    }

    const audio = this.sounds.get(id);
    if (audio) {
      audio.volume = adjustedVolume;
      await audio.play();
    } else {
      throw new Error("valid ID had no associated HTMLAudioElement");
    }

    return;
  }

  /** Initializes all HTMLAudioElements used within the package. */
  private setupAlertSounds() {
    for (const i in soundsFileData) {
      const value = soundsFileData[i];
      if (!value) continue;

      this.sounds.set(i, new Audio(path.join(soundPath, value.filename)));
    }

    return;
  }
}
