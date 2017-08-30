import { CompositeDisposable, Disposable, Range } from "atom";

import { FilterManager } from "./filter-manager";
import { SoundPlayer } from "./sound-player";
import * as Helpers from "./helpers";

interface DecorationData {
  marker: AtomTextBuffer.DisplayMarker
  decoration: AtomCore.Decoration
}

interface Decorations {
  colorDecorations: DecorationData[]
  alertDecorations: DecorationData[]
}

export class DecorationManager {
  private readonly filterManager: FilterManager;
  private readonly soundPlayer: SoundPlayer;
  private readonly packageName: string;
  private readonly subscriptions: CompositeDisposable;
  private decorations: Map<number, Decorations>;
  private editorSub: Map<number, Disposable>;

  constructor(filterManager: FilterManager, soundPlayer: SoundPlayer, packageName: string) {
    this.filterManager = filterManager;
    this.soundPlayer = soundPlayer;
    this.packageName = packageName;
    this.subscriptions = new CompositeDisposable;
    this.decorations = new Map;
    this.editorSub = new Map;

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
      this.monitorCursors(data.editor);
      this.handleNewFilter(data);
    }));

    this.subscriptions.add(this.filterManager.onDidReprocessFilter((data) => {
      this.handleFilterUpdate(data);
    }));

    this.subscriptions.add(this.filterManager.onDidDestroyFilter((editorID) => {
      // We call into handleFilterDestruction on filter updates as well, which
      // would result the editor subscription(s) being disposed of while the
      // editor is still open.
      const sub = this.editorSub.get(editorID);
      if(sub) sub.dispose();

      this.handleFilterDestruction(editorID);
    }));
  }

  private handleNewFilter(data: Filter.Params.ProcessedFilterData) {
    const decorations = this.updateLines(data.editor, data.lines);
    this.decorations.set((<Revelations.TextEditor>data.editor).id, decorations);

    return;
  }

  private handleFilterUpdate(params: Filter.Params.ReprocessedFilterData) {
    this.handleFilterDestruction((<Revelations.TextEditor>params.editor).id);
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
          gutterName: this.packageName, class: "poe-decoration-row",
          item: element });
      container.push({ marker, decoration });
    });

    return result;
  }

  private createSoundElement(id: string, volume?: number) {
    const element = document.createElement("span");
    element.className = "poe-play-alert-sound";

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

  // The code for this function is originally from the "linter-ui-default"
  // repository. It has been modified slightly to work with our implementation
  // here. The original code can be found here:
  //  https://goo.gl/whP9ZY
  private monitorCursors(editor: AtomCore.TextEditor) {
    const previousSub = this.editorSub.get((<Revelations.TextEditor>editor).id);
    if(previousSub) previousSub.dispose();

    const editorSub = editor.observeCursors((cursor) => {
      let marker: AtomTextBuffer.DisplayMarker;
      let lastRange: AtomTextBuffer.Range;
      let lastEmpty: boolean;

      const handlePositionChange = ((start: AtomTextBuffer.PointLike, end:
          AtomTextBuffer.PointLike) => {
        const gutter = editor.gutterWithName(this.packageName);
        if(!gutter) return;

        // We need that Range.fromObject hack below because when we focus index 0 on multi-line selection
        // end.column is the column of the last line but making a range out of two and then accesing
        // the end seems to fix it (black magic?)
        const currentRange = Range.fromObject([start, end]);
        const linesRange = Range.fromObject([[start.row, 0], [end.row, Infinity]]);
        const currentEmpty = currentRange.isEmpty();

        // NOTE: Atom does not paint gutter if multi-line and last line has zero index
        if (start.row !== end.row && currentRange.end.column === 0) {
          linesRange.end.row--;
        }

        if (lastRange && lastRange.isEqual(linesRange) && currentEmpty === lastEmpty) return;
        if (marker) marker.destroy();
        lastRange = linesRange;
        lastEmpty = currentEmpty;

        marker = editor.markScreenRange(linesRange, {
          invalidate: "never",
        });

        const item = document.createElement("span");
        item.className = `line-number cursor-line ${currentEmpty ? 'cursor-line-no-selection' : ''}`
        gutter.decorateMarker(marker, {
          item,
          class: "poe-decoration-row",
        });
      });

      const cursorMarker = cursor.getMarker();
      const cursorSubs = new CompositeDisposable;

      cursorSubs.add(cursorMarker.onDidChange((params) => {
        const { newHeadScreenPosition, newTailScreenPosition } = params;
        handlePositionChange(newHeadScreenPosition, newTailScreenPosition);
      }));

      cursorSubs.add(cursor.onDidDestroy(() => {
        cursorSubs.dispose();
      }));

      cursorSubs.add(new Disposable(function() {
        if (marker) marker.destroy();
      }));

      const screenRange = cursorMarker.getScreenRange();
      handlePositionChange(screenRange.start, screenRange.end);
    });

    this.editorSub.set((<Revelations.TextEditor>editor).id, editorSub);
  }
}
