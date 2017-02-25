import { Emitter, CompositeDisposable, Directory } from "atom";

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

  emitter.on('play-alert-sound', (id: number) => {
    if(id < 1 || id > 9) return;

    const audio = alertMapping.get(id);
    if(audio) audio.play();
  })
}

export function deactivate() {
  emitter.clear();
}
