import {
  CompositeDisposable, Decoration, DisplayMarker, Disposable, PointLike, Range,
  TextEditor
} from "atom";

import { FilterManager, ProcessedFilterData } from "./filter-manager";
import {
  isPlayAlertSoundRule, isSetBackgroundColorRule, isSetBorderColorRule, isSetTextColorRule
} from "./helpers";
import * as Filter from "./item-filter";
import { SoundPlayer } from "./sound-player";

interface DecorationData {
  marker: DisplayMarker;
  decoration: Decoration;
}

interface Decorations {
  colorDecorations: DecorationData[];
  alertDecorations: DecorationData[];
}

export class DecorationManager {
  private readonly filterManager: FilterManager;
  private readonly soundPlayer: SoundPlayer;
  private readonly packageName: string;
  private readonly subscriptions: CompositeDisposable;
  private decorations: Map<number, Decorations>;
  private editorSub: Map<number, Disposable>;

  constructor(filterManager: FilterManager) {
    this.filterManager = filterManager;
    this.packageName = "path-of-exile-item-filter";
    this.subscriptions = new CompositeDisposable();
    this.decorations = new Map();
    this.editorSub = new Map();
    this.soundPlayer = new SoundPlayer();

    this.setupSubscriptions();
  }

  dispose() {
    this.decorations.forEach(data => {
      data.alertDecorations.forEach(decorationData => {
        decorationData.marker.destroy();
      });

      data.colorDecorations.forEach(decorationData => {
        decorationData.marker.destroy();
      });
    });

    this.subscriptions.dispose();
  }

  private setupSubscriptions() {
    this.subscriptions.add(
      this.filterManager.observeProcessedFilters(data => {
        this.monitorCursors(data.editor);
        this.handleNewFilter(data);
      }),

      this.filterManager.onDidReprocessFilter(data => {
        this.handleFilterUpdate(data);
      }),

      this.filterManager.onDidDestroyFilter(editorID => {
        // We call into handleFilterDestruction on filter updates as well, which
        // would result the editor subscription(s) being disposed of while the
        // editor is still open.
        const sub = this.editorSub.get(editorID);
        if (sub) {
          sub.dispose();
        }

        this.handleFilterDestruction(editorID);
      })
    );
  }

  private handleNewFilter(data: ProcessedFilterData) {
    const decorations = this.updateLines(data.editor, data.lines);
    this.decorations.set(data.editor.id, decorations);
  }

  private handleFilterUpdate(params: ProcessedFilterData) {
    this.handleFilterDestruction(params.editor.id);
    this.handleNewFilter(params);
  }

  private handleFilterDestruction(editorID: number) {
    const decorations = this.decorations.get(editorID);

    if (decorations) {
      decorations.alertDecorations.forEach(decorationData => {
        decorationData.marker.destroy();
      });
      decorations.colorDecorations.forEach(decorationData => {
        decorationData.marker.destroy();
      });
    }
  }

  private updateLines(editor: TextEditor, lines: Filter.Line[]) {
    const result: Decorations = {
      alertDecorations: [],
      colorDecorations: [],
    };

    lines.forEach(line => {
      if (line.invalid) return;

      let element: HTMLElement;
      let container: DecorationData[];
      if (isSetTextColorRule(line) || isSetBorderColorRule(line) ||
          isSetBackgroundColorRule(line)) {
        if (line.red === undefined || line.blue === undefined || line.green === undefined) {
          return;
        }

        let alpha: number|undefined;
        if (line.alpha) {
          alpha = line.alpha.value;
        }
        element = this.createColorElement(line.red.value, line.green.value,
            line.blue.value, alpha);
        container = result.colorDecorations;
      } else if (isPlayAlertSoundRule(line)) {
        if (line.id === undefined) {
          return;
        }

        let volume: number|undefined;
        if (line.volume) {
          volume = line.volume.value;
        }
        element = this.createSoundElement(line.id.value, volume);
        container = result.alertDecorations;
      } else {
        return;
      }

      const range = new Range([line.range.start.row, 0], [line.range.start.row, 1]);
      const marker = editor.markBufferRange(range, { invalidate: "never" });
      const decoration = editor.decorateMarker(marker, {
        type: "gutter",
        gutterName: this.packageName,
        class: "poe-decoration-row",
        item: element,
      });
      container.push({ marker, decoration });
    });

    return result;
  }

  private createSoundElement(id: string, volume?: number) {
    const element = document.createElement("span");
    element.className = "poe-play-alert-sound";

    element.onclick = async () => {
      await this.soundPlayer.playAlertSound(id, volume);
    };

    return element;
  }

  private createColorElement(red: number, green: number, blue: number, alpha?: number) {
    const element = document.createElement("span");
    element.className = "poe-set-color-rule";

    let colorCode = `${red},${green},${blue}`;
    if (alpha) {
      // GGG uses a scale of 0 to 255 for transparency, which we need
      // to convert to 0.0 to 1.0.
      const adjustedAlpha = alpha / 255;
      colorCode += `,${adjustedAlpha}`;
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
  private monitorCursors(editor: TextEditor) {
    const previousSub = this.editorSub.get(editor.id);
    if (previousSub) {
      previousSub.dispose();
    }

    const editorSub = editor.observeCursors(cursor => {
      let marker: DisplayMarker;
      let lastRange: Range;
      let lastEmpty: boolean;

      const handlePositionChange = ((start: PointLike, end: PointLike) => {
        const gutter = editor.gutterWithName(this.packageName);
        if (!gutter) {
          return;
        }

        // We need that Range.fromObject hack below because when we focus index 0
        // on multi-line selection end.column is the column of the last line but
        // making a range out of two and then accessing the end seems to fix it.
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
        item.className = `line-number cursor-line ${currentEmpty ?
            "cursor-line-no-selection" : ""}`;
        gutter.decorateMarker(marker, {
          item,
          class: "poe-decoration-row",
        });
      });

      const cursorMarker = cursor.getMarker();
      const cursorSubs = new CompositeDisposable();

      cursorSubs.add(cursorMarker.onDidChange(params => {
        const { newHeadScreenPosition, newTailScreenPosition } = params;
        handlePositionChange(newHeadScreenPosition, newTailScreenPosition);
      }));

      cursorSubs.add(cursor.onDidDestroy(() => {
        cursorSubs.dispose();
      }));

      cursorSubs.add(new Disposable(() => {
        if (marker) marker.destroy();
      }));

      const screenRange = cursorMarker.getScreenRange();
      handlePositionChange(screenRange.start, screenRange.end);
    });

    this.editorSub.set(editor.id, editorSub);
  }
}
