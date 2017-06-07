"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const Helpers = require("./helpers");
class DecorationManager {
    constructor(filterManager, soundPlayer, packageName) {
        this.filterManager = filterManager;
        this.soundPlayer = soundPlayer;
        this.packageName = packageName;
        this.subscriptions = new atom_1.CompositeDisposable;
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
    setupSubscriptions() {
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
    handleNewFilter(data) {
        const decorations = this.updateLines(data.editor, data.lines);
        this.decorations.set(data.editor.id, decorations);
        return;
    }
    handleFilterUpdate(params) {
        this.handleFilterDestruction(params.editor.id);
        this.handleNewFilter(params);
        return;
    }
    handleFilterDestruction(editorID) {
        const decorations = this.decorations.get(editorID);
        if (decorations) {
            decorations.alertDecorations.forEach((decorationData) => {
                decorationData.marker.destroy();
            });
            decorations.colorDecorations.forEach((decorationData) => {
                decorationData.marker.destroy();
            });
        }
    }
    updateLines(editor, lines) {
        const result = {
            alertDecorations: [],
            colorDecorations: []
        };
        lines.forEach((line) => {
            if (line.invalid)
                return;
            if (Helpers.Guards.isSetTextColorRule(line) || Helpers.Guards.isSetBorderColorRule(line) ||
                Helpers.Guards.isSetBackgroundColorRule(line)) {
                if (line.red == null || line.blue == null || line.green == null)
                    return;
                let alpha;
                if (line.alpha)
                    alpha = line.alpha.value;
                var element = this.createColorElement(line.red.value, line.green.value, line.blue.value, alpha);
                var container = result.colorDecorations;
            }
            else if (Helpers.Guards.isPlayAlertSoundRule(line)) {
                if (line.id == null)
                    return;
                let volume;
                if (line.volume)
                    volume = line.volume.value;
                var element = this.createSoundElement(line.id.value, volume);
                var container = result.alertDecorations;
            }
            else {
                return;
            }
            const range = new atom_1.Range([line.range.start.row, 0], [line.range.start.row, 1]);
            const marker = editor.markBufferRange(range, { invalidate: "never" });
            const decoration = editor.decorateMarker(marker, { type: "gutter",
                gutterName: this.packageName, class: "poe-decoration-container",
                item: element });
            container.push({ marker, decoration });
        });
        return result;
    }
    createSoundElement(id, volume) {
        const element = document.createElement("span");
        element.className = 'poe-play-alert-sound';
        element.onclick = () => {
            this.soundPlayer.playAlertSound(id, volume);
        };
        return element;
    }
    createColorElement(red, green, blue, alpha) {
        const element = document.createElement("span");
        element.className = "poe-set-color-rule";
        let colorCode = red + "," + green + "," + blue;
        if (alpha) {
            const adjustedAlpha = alpha / 255;
            colorCode += "," + adjustedAlpha;
            element.setAttribute("style", "background-color:rgba(" + colorCode + ");");
        }
        else {
            element.setAttribute("style", "background-color:rgb(" + colorCode + ");");
        }
        return element;
    }
}
exports.default = DecorationManager;
