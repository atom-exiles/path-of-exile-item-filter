import * as path from "path";
import * as assert from "assert";

const soundPath = path.join(__dirname + '/../media/sounds');
// const orbsWithSounds = [
//   "Alchemy", "Blessed", "Chaos", "Divine", "Exalted", "Fusing", "General", "Mirror", "Regal", "Vaal"
// ]

export default class SoundPlayer {
  private readonly sounds: Map<number, HTMLAudioElement>;

  constructor() {
    this.sounds = new Map;
    this.setupAlertSounds();
  }

  dispose() {
    this.sounds.clear();

    return;
  }

  /** Play the alert sound associated with the given ID. Optionally, play the alert
   *  at the given volume level. The volume level should be a number from 0 to 300. */
  playAlertSound(id: number, volume?: number) {
    assert(typeof id === 'number', 'sound identifier missing for playAlertSound');
    assert(id >= 1 && id <= 16, 'sound identifier must be a value from 1 to 9');

    // Path of Exile uses a range of 0 to 300 to determine volume, with 300
    // equating to 100% volume on the source.
    if(volume) {
      assert(typeof volume === 'number', 'sound volume, if given, must be a number');
      assert(volume >=0 && volume <= 300, 'sound volume must be a value from 1 to 300');

      var adjustedVolume = volume / 300;
    } else {
      var adjustedVolume = 100 / 300;
    }

    const audio = this.sounds.get(id);
    if(audio) {
      audio.volume = adjustedVolume;
      audio.play();
    } else {
      throw new Error("valid ID had no associated HTMLAudioElement");
    }

    return;
  }

  /** Initializes all HTMLAudioElements used within the package. */
  private setupAlertSounds() {
    for(var i = 1; i <= 16; i++) {
      const prefix = i < 10 ? "0": "";
      this.sounds.set(i, new Audio(path.join(soundPath, "/AlertSound_" + prefix + i + ".mp3")));
    }

    return;
  }
}
