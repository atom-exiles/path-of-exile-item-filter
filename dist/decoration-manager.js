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
const helpers_1 = require("./helpers");
const sound_player_1 = require("./sound-player");
class DecorationManager {
    constructor(filterManager) {
        this.filterManager = filterManager;
        this.packageName = "path-of-exile-item-filter";
        this.subscriptions = new atom_1.CompositeDisposable();
        this.decorations = new Map();
        this.editorSub = new Map();
        this.soundPlayer = new sound_player_1.SoundPlayer();
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
    setupSubscriptions() {
        this.subscriptions.add(this.filterManager.observeProcessedFilters(data => {
            this.monitorCursors(data.editor);
            this.handleNewFilter(data);
        }), this.filterManager.onDidReprocessFilter(data => {
            this.handleFilterUpdate(data);
        }), this.filterManager.onDidDestroyFilter(editorID => {
            const sub = this.editorSub.get(editorID);
            if (sub) {
                sub.dispose();
            }
            this.handleFilterDestruction(editorID);
        }));
    }
    handleNewFilter(data) {
        const decorations = this.updateLines(data.editor, data.lines);
        this.decorations.set(data.editor.id, decorations);
    }
    handleFilterUpdate(params) {
        this.handleFilterDestruction(params.editor.id);
        this.handleNewFilter(params);
    }
    handleFilterDestruction(editorID) {
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
    updateLines(editor, lines) {
        const result = {
            alertDecorations: [],
            colorDecorations: [],
        };
        lines.forEach(line => {
            if (line.invalid)
                return;
            let element;
            let container;
            if (helpers_1.isSetTextColorRule(line) || helpers_1.isSetBorderColorRule(line) ||
                helpers_1.isSetBackgroundColorRule(line)) {
                if (line.red === undefined || line.blue === undefined || line.green === undefined) {
                    return;
                }
                let alpha;
                if (line.alpha) {
                    alpha = line.alpha.value;
                }
                element = this.createColorElement(line.red.value, line.green.value, line.blue.value, alpha);
                container = result.colorDecorations;
            }
            else if (helpers_1.isPlayAlertSoundRule(line)) {
                if (line.id === undefined) {
                    return;
                }
                let volume;
                if (line.volume) {
                    volume = line.volume.value;
                }
                element = this.createSoundElement(line.id.value, volume);
                container = result.alertDecorations;
            }
            else {
                return;
            }
            const range = new atom_1.Range([line.range.start.row, 0], [line.range.start.row, 1]);
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
    createSoundElement(id, volume) {
        const element = document.createElement("span");
        element.className = "poe-play-alert-sound";
        element.onclick = () => __awaiter(this, void 0, void 0, function* () {
            yield this.soundPlayer.playAlertSound(id, volume);
        });
        return element;
    }
    createColorElement(red, green, blue, alpha) {
        const element = document.createElement("span");
        element.className = "poe-set-color-rule";
        let colorCode = `${red},${green},${blue}`;
        if (alpha) {
            const adjustedAlpha = alpha / 255;
            colorCode += `,${adjustedAlpha}`;
            element.setAttribute("style", "background-color:rgba(" + colorCode + ");");
        }
        else {
            element.setAttribute("style", "background-color:rgb(" + colorCode + ");");
        }
        return element;
    }
    monitorCursors(editor) {
        const previousSub = this.editorSub.get(editor.id);
        if (previousSub) {
            previousSub.dispose();
        }
        const editorSub = editor.observeCursors(cursor => {
            let marker;
            let lastRange;
            let lastEmpty;
            const handlePositionChange = ((start, end) => {
                const gutter = editor.gutterWithName(this.packageName);
                if (!gutter) {
                    return;
                }
                const currentRange = atom_1.Range.fromObject([start, end]);
                const linesRange = atom_1.Range.fromObject([[start.row, 0], [end.row, Infinity]]);
                const currentEmpty = currentRange.isEmpty();
                if (start.row !== end.row && currentRange.end.column === 0) {
                    linesRange.end.row--;
                }
                if (lastRange && lastRange.isEqual(linesRange) && currentEmpty === lastEmpty)
                    return;
                if (marker)
                    marker.destroy();
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
            const cursorSubs = new atom_1.CompositeDisposable();
            cursorSubs.add(cursorMarker.onDidChange(params => {
                const { newHeadScreenPosition, newTailScreenPosition } = params;
                handlePositionChange(newHeadScreenPosition, newTailScreenPosition);
            }));
            cursorSubs.add(cursor.onDidDestroy(() => {
                cursorSubs.dispose();
            }));
            cursorSubs.add(new atom_1.Disposable(() => {
                if (marker)
                    marker.destroy();
            }));
            const screenRange = cursorMarker.getScreenRange();
            handlePositionChange(screenRange.start, screenRange.end);
        });
        this.editorSub.set(editor.id, editorSub);
    }
}
exports.DecorationManager = DecorationManager;
