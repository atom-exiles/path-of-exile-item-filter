import { Emitter, CompositeDisposable } from "atom";

import * as path from "path";

const soundPath = path.join(__dirname + "/../media/sounds");

export var emitter = new Emitter;

// TODO(glen): determine whether or not these need to be throttled.
function setupAlertSounds(container: Map<number, HTMLAudioElement>) {
  for(var i = 1; i < 10; i++) {
    container.set(i, new Audio(path.join(soundPath, "/AlertSound_0" + i + ".mp3")));
  }
}

export function activate() {
  const alertMapping = new Map<number, HTMLAudioElement>();

  setupAlertSounds(alertMapping);

  emitter.on("play-alert-sound", (params: Sound.Params.PlayAlertSound) => {
    if(params.id < 1 || params.id > 9) return;

    // Path of Exile uses a range of 0 to 300 to determine volume, with 300
    // equating to 100% volume on the source.
    var volume: number;
    if(params.volume) {
      if(params.volume > 0 || params.volume <= 300) volume = params.volume / 300;
      else return;
    } else {
      volume = 100 / 300; // Default volume is 100 or 0.333~% of the source.
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
