import { Emitter, CompositeDisposable } from "atom";

import * as assert from "assert";
import * as path from "path";

const soundPath = path.join(__dirname + "/../media/sounds");
export var emitter = new Emitter;

function setupAlertSounds(container: Map<number, HTMLAudioElement>) {
  for(var i = 1; i < 10; i++) {
    container.set(i, new Audio(path.join(soundPath, "/AlertSound_0" + i + ".mp3")));
  }
}

export function activate() {
  const alertMapping = new Map<number, HTMLAudioElement>();
  setupAlertSounds(alertMapping);

  emitter.on("play-alert-sound", (params: Sound.Params.PlayAlertSound) => {
    assert(params && params.id, "missing parameters for 'play-alert-sound' emission.");
    if(params.id < 1 || params.id > 9) return;

    // Path of Exile uses a range of 0 to 300 to determine volume, with 300
    // equating to 100% volume on the source.
    var volume: number;
    if(params.volume) {
      if(params.volume < 0 || params.volume > 300) return;
      volume = params.volume / 300;
    } else {
      volume = 100 / 300; // Default volume is 100 or 0.33~ of the source volume.
    }

    const audio = alertMapping.get(params.id);
    if(audio) {
      audio.volume = volume;
      audio.play();
    }
  });
}

export function deactivate() {
  emitter.clear();
}
