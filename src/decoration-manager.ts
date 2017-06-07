import { CompositeDisposable, Range } from "atom";

import FilterManager from "./filter-manager";
import SoundPlayer from "./sound-player";
import * as Helpers from "./helpers";

interface DecorationData {
  marker: TextBuffer.DisplayMarker
  decoration: AtomCore.Decoration
}

interface Decorations {
  colorDecorations: DecorationData[]
  alertDecorations: DecorationData[]
}

export default class DecorationManager {
  private readonly filterManager: FilterManager;
  private readonly soundPlayer: SoundPlayer;
  private readonly packageName: string;
  private readonly subscriptions: CompositeDisposable;
  private decorations: Map<number, Decorations>;

  constructor(filterManager: FilterManager, soundPlayer: SoundPlayer, packageName: string) {
    this.filterManager = filterManager;
    this.soundPlayer = soundPlayer;
    this.packageName = packageName;
    this.subscriptions = new CompositeDisposable;
    this.decorations = new Map;

    this.setupSubscriptions();
  }

  dispose() {
    this.decorations.forEach((data) => {
      data.alertDecorations.forEach((decorationData) => {
        decorationData.marker.destroy();
      });

      data.colorDecorations.forEach((decorationData) => {
        decorationData.marker.destroy();
      });
    });

    this.subscriptions.dispose();
  }

  private setupSubscriptions() {
    this.subscriptions.add(this.filterManager.observeProcessedFilters((data) => {
      this.handleNewFilter(data);
    }));

    this.subscriptions.add(this.filterManager.onDidReprocessFilter((data) => {
      this.handleFilterUpdate(data);
    }));

    this.subscriptions.add(this.filterManager.onDidDestroyFilter((editorID) => {
      this.handleFilterDestruction(editorID);
    }));
  }

  private handleNewFilter(data: Filter.Params.ProcessedFilterData) {
    const decorations = this.updateLines(data.editor, data.lines);
    this.decorations.set(data.editor.id, decorations);

    return;
  }

  private handleFilterUpdate(params: Filter.Params.ReprocessedFilterData) {
    this.handleFilterDestruction(params.editor.id);
    this.handleNewFilter(params);

    return;
  }

  private handleFilterDestruction(editorID: number) {
    const decorations = this.decorations.get(editorID);

    if(decorations) {
      decorations.alertDecorations.forEach((decorationData) => {
        decorationData.marker.destroy();
      });
      decorations.colorDecorations.forEach((decorationData) => {
        decorationData.marker.destroy();
      });
    }
  }

  private updateLines(editor: AtomCore.TextEditor, lines: Filter.Line[]) {
    const result: Decorations = {
      alertDecorations: [],
      colorDecorations: []
    }

    lines.forEach((line) => {
      if(line.invalid) return;

      if(Helpers.Guards.isSetTextColorRule(line) || Helpers.Guards.isSetBorderColorRule(line) ||
          Helpers.Guards.isSetBackgroundColorRule(line)) {
        if(line.red == null || line.blue == null || line.green == null) return;

        let alpha: number|undefined;
        if(line.alpha) alpha = line.alpha.value;
        var element = this.createColorElement(line.red.value, line.green.value, line.blue.value, alpha);
        var container = result.colorDecorations;
      } else if(Helpers.Guards.isPlayAlertSoundRule(line)) {
        if(line.id == null) return;

        let volume: number|undefined;
        if(line.volume) volume = line.volume.value;
        var element = this.createSoundElement(line.id.value, volume);
        var container = result.alertDecorations;
      } else {
        return;
      }

      const range = new Range([line.range.start.row, 0], [line.range.start.row, 1]);
      const marker = editor.markBufferRange(range, { invalidate: "never" });
      const decoration = editor.decorateMarker(marker, { type: "gutter",
          gutterName: this.packageName, class: "poe-decoration-container",
          item: element });
      container.push({ marker, decoration });
    });

    return result;
  }

  private createSoundElement(id: number, volume?: number) {
    const element = document.createElement("span");
    element.className = 'poe-play-alert-sound';

    element.onclick = () => {
      this.soundPlayer.playAlertSound(id, volume);
    };

    return element;
  }

  private createColorElement(red: number, green: number, blue: number, alpha?: number) {
    const element = document.createElement("span");
    element.className = "poe-set-color-rule";

    let colorCode = red + "," + green + "," + blue;
    if(alpha) {
      // GGG uses a scale of 0 to 255 for transparency, which we need
      // to convert to 0.0 to 1.0.
      const adjustedAlpha = alpha / 255;
      colorCode += "," + adjustedAlpha;
      element.setAttribute("style", "background-color:rgba(" + colorCode + ");");
    } else {
      element.setAttribute("style", "background-color:rgb(" + colorCode + ");");
    }

    return element;
  }
}
