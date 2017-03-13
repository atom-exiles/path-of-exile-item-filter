"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const settings = require("./settings");
const filterData = require("./filter-manager");
const sound = require("./sound");
function updateGutterDecorations(args) {
    const enableAlertDecorations = settings.config.generalSettings.
        enableAlertDecorations.get();
    const enableSetColorDecorations = settings.config.generalSettings.
        enableSetColorDecorations.get();
    if (filters.has(args.editor.buffer.id)) {
        const decorationData = filters.get(args.editor.buffer.id);
        if (decorationData) {
            decorationData.decorations.forEach((decoration) => {
                decoration.marker.destroy();
            });
        }
    }
    const markers = [];
    for (var line of args.lines) {
        if (line.type == "Rule" && !line.invalid) {
            const ld = line.data;
            var element;
            var decorationType;
            switch (ld.type.name) {
                case "PlayAlertSound":
                    {
                        if (!enableAlertDecorations)
                            continue;
                        decorationType = "AlertDecoration";
                        element = document.createElement("span");
                        element.className = "poe-play-alert-sound";
                        element.onclick = () => {
                            var options = {
                                id: ld.values[0].value
                            };
                            if (ld.values.length == 2)
                                options.volume = ld.values[1].value;
                            sound.emitter.emit("play-alert-sound", options);
                        };
                    }
                    break;
                case "SetBorderColor":
                case "SetTextColor":
                case "SetBackgroundColor":
                    {
                        decorationType = "SetColorDecoration";
                        if (!enableSetColorDecorations)
                            continue;
                        element = document.createElement("span");
                        element.className = "poe-set-color-rule";
                        var colorCode = ld.values[0].value + "," + ld.values[1].value + "," +
                            ld.values[2].value;
                        if (ld.values.length == 4) {
                            const alpha = ld.values[3].value / 255;
                            colorCode += "," + alpha;
                            element.setAttribute("style", "background-color:rgba(" + colorCode + ");");
                        }
                        else {
                            element.setAttribute("style", "background-color:rgb(" + colorCode + ");");
                        }
                    }
                    break;
                default:
                    continue;
            }
            const r = new atom_1.Range([ld.range.start.row, 0], [ld.range.start.row, 1]);
            const marker = args.editor.markBufferRange(r, { invalidate: "never" });
            const decoration = args.editor.decorateMarker(marker, { type: "gutter",
                gutterName: "linter", class: "poe-decoration-container", item: element });
            markers.push({ type: decorationType, marker: marker, decoration: decoration });
        }
    }
    const result = {
        editor: args.editor,
        decorations: markers
    };
    filters.set(args.editor.buffer.id, result);
}
var subscriptions;
const filters = new Map();
function activate() {
    subscriptions = new atom_1.CompositeDisposable;
    subscriptions.add(filterData.emitter.on("poe-did-process-filter", (args) => {
        updateGutterDecorations(args);
    }));
    subscriptions.add(filterData.emitter.on("poe-did-destroy-filter", (editorID) => {
        filters.forEach((decorationsData, editorID) => {
            decorationsData.decorations.forEach((decoration) => {
                decoration.marker.destroy();
            });
        });
        filters.delete(editorID);
    }));
    const configChangeAction = (type, newValue) => {
        filters.forEach((decorationData, editorID) => __awaiter(this, void 0, void 0, function* () {
            if (newValue) {
                const buffer = filterData.buffers.get(editorID);
                if (!buffer)
                    throw new Error("gutter-decorations held onto a dead buffer");
                const fd = yield buffer.filter;
                if (fd) {
                    const update = {
                        editor: decorationData.editor,
                        lines: fd
                    };
                    updateGutterDecorations(update);
                }
            }
            else {
                const remainingDecorations = [];
                decorationData.decorations.forEach((decoration) => {
                    if (decoration.type != type) {
                        remainingDecorations.push(decoration);
                    }
                    else {
                        decoration.marker.destroy();
                    }
                });
                filters.set(editorID, { editor: decorationData.editor,
                    decorations: remainingDecorations });
            }
        }));
    };
    subscriptions.add(settings.config.generalSettings.enableAlertDecorations.
        onDidChange((event) => {
        configChangeAction("AlertDecoration", event.newValue);
    }));
    subscriptions.add(settings.config.generalSettings.enableSetColorDecorations.
        onDidChange((event) => {
        configChangeAction("SetColorDecoration", event.newValue);
    }));
}
exports.activate = activate;
;
function deactivate() {
    filters.clear();
    subscriptions.dispose();
}
exports.deactivate = deactivate;
;
