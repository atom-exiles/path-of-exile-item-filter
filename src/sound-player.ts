import * as path from "path";
import * as assert from "assert";

import { JSONData } from "./json-data";

const soundPath = path.join(__dirname + '/../media/sounds');

export class SoundPlayer {
  private readonly sounds: Map<string, HTMLAudioElement>;

  constructor(jsonData: JSONData) {
    this.sounds = new Map;

    jsonData.data.then((data) => {
      this.setupAlertSounds(data);
    });
  }

  dispose() {
    this.sounds.clear();

    return;
  }

  /** Play the alert sound associated with the given ID. Optionally, play the alert
   *  at the given volume level. The volume level should be a number from 0 to 300. */
  playAlertSound(id: string, volume?: number) {
    assert(this.sounds.get(id), "unknown sound " + id + " passed to playAlertSound");

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
  private setupAlertSounds(data: DataFormat.JSONData) {
    for(var i in data.sounds) {
      const value = data.sounds[i];
      if(!value) continue;

      this.sounds.set(i, new Audio(path.join(soundPath, value.filename)));
    }

    return;
  }
}
