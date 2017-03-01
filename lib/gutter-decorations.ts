import { Range, CompositeDisposable } from "atom";
import * as assert from "assert";

import * as settings from "./settings";
import * as filterData from "./filter-data";
import * as sound from "./sound";

interface GutterDecoration {
  type: "AlertDecoration"|"SetColorDecoration"
  marker: any
  decoration: any
}

interface DecorationData {
  editor: AtomCore.TextEditor
  decorations: GutterDecoration[]
}

function updateGutterDecorations(args: Filter.Params.DataUpdate) {
  const enableAlertDecorations = settings.config.generalSettings.
      enableAlertDecorations.get();
  const enableSetColorDecorations = settings.config.generalSettings.
      enableSetColorDecorations.get();

  if(filters.has(args.editor.buffer.id)) {
    const decorationData = filters.get(args.editor.buffer.id);
    if(decorationData) {
      decorationData.decorations.forEach((decoration) => {
        decoration.marker.destroy();
      });
    }
  }

  const markers: GutterDecoration[] = [];
  for(var line of args.lines) {
    if(line.type == "Rule" && !line.invalid) {
      const ld = (<Filter.Rule>line.data);
      var element: HTMLSpanElement;
      var decorationType: "AlertDecoration"|"SetColorDecoration";

      switch(ld.type.name) {
        case "PlayAlertSound": {
          if(!enableAlertDecorations) continue;
          decorationType = "AlertDecoration";
          element = document.createElement("span");
          element.className = "poe-play-alert-sound";

          element.onclick = () => {
            var options: Sound.Params.PlayAlertSound = {
              id: ld.values[0].value
            };
            if(ld.values.length == 2) options.volume = ld.values[1].value;
            sound.emitter.emit("play-alert-sound", options);
          };
        } break;
        case "SetBorderColor":
        case "SetTextColor":
        case "SetBackgroundColor": {
          decorationType = "SetColorDecoration";
          if(!enableSetColorDecorations) continue;
          element = document.createElement("span");
          element.className = "poe-set-color-rule";

          var colorCode = ld.values[0].value + "," + ld.values[1].value + "," +
              ld.values[2].value;
          if(ld.values.length == 4) {
            // GGG uses a scale of 0 to 255 for transparency, which we need
            // to convert to 0.0 to 1.0.
            const alpha = ld.values[3].value / 255;
            colorCode += "," + alpha;
            element.setAttribute("style", "background-color:rgba(" + colorCode + ");");
          } else {
            element.setAttribute("style", "background-color:rgb(" + colorCode + ");");
          }
        } break;
        default:
          continue;
      }
      const r = new Range([ld.range.start.row, 0], [ld.range.start.row, 1]);
      const marker = args.editor.markBufferRange(r, { invalidate: "never" });
      const decoration = args.editor.decorateMarker(marker, { type: "gutter",
          gutterName: "linter", class: "poe-decoration-container", item: element });
      markers.push({ type: decorationType, marker: marker, decoration: decoration });
    }
  }
  const result: DecorationData = {
    editor: args.editor,
    decorations: markers
  }

  filters.set(args.editor.buffer.id, result);
}

var subscriptions: CompositeDisposable;
const filters = new Map<string, DecorationData>();

export function activate() {
  subscriptions = new CompositeDisposable;

  subscriptions.add(filterData.emitter.on("poe-did-process-filter",
      (args: Filter.Params.DataUpdate) => {
    updateGutterDecorations(args);
  }));

  subscriptions.add(filterData.emitter.on("poe-did-destroy-filter",
      (editorID: string) => {
    filters.delete(editorID);
  }));

  const configChangeAction =  (type: "AlertDecoration"|"SetColorDecoration",
      newValue: boolean) => {
    filters.forEach(async (decorationData, editorID) => {
      if(newValue) {
        const buffer = filterData.buffers.get(editorID);
        if(!buffer) throw new Error("gutter-decorations held onto a dead buffer");

        const fd = await buffer.filter;
        if(fd) {
          const update: Filter.Params.DataUpdate = {
            editor: decorationData.editor,
            lines: fd
          };
          updateGutterDecorations(update);
        }
      } else {
        // Just ignore the decorations that don't match, then reset the value
        // within the map.
        const remainingDecorations: GutterDecoration[] = [];
        decorationData.decorations.forEach((decoration) => {
          if(decoration.type != type) {
            remainingDecorations.push(decoration);
          } else {
            decoration.marker.destroy();
          }
        });
        filters.set(editorID, { editor: decorationData.editor,
            decorations: remainingDecorations});
      }
    });
  }

  subscriptions.add(settings.config.generalSettings.enableAlertDecorations.
      onDidChange((newValue) => {
    configChangeAction("AlertDecoration", newValue.newValue);
  }));

  subscriptions.add(settings.config.generalSettings.enableSetColorDecorations.
      onDidChange((newValue) => {
    configChangeAction("SetColorDecoration", newValue.newValue);
  }));
};

export function deactivate() {
  filters.clear();
  subscriptions.dispose();
};
