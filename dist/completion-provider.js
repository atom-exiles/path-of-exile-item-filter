"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atom_1 = require("atom");
const helpers_1 = require("./helpers");
class CompletionProvider {
    constructor(suggestions) {
        this.suggestions = suggestions;
    }
    dispose() { }
    getSuggestions(event) {
        let result = [];
        const { editor, bufferPosition, scopeDescriptor } = event;
        let prefix = this.getPrefix(editor, bufferPosition);
        const cursorScopes = scopeDescriptor.getScopesArray();
        const lastScope = cursorScopes[cursorScopes.length - 1];
        let previousLastScope;
        if (bufferPosition.column > 0) {
            const previousPosition = new atom_1.Point(bufferPosition.row, bufferPosition.column - 1);
            const previousPositionScopes = editor.scopeDescriptorForBufferPosition(previousPosition)
                .getScopesArray();
            previousLastScope = previousPositionScopes[previousPositionScopes.length - 1];
        }
        let shouldPruneSuggestions = true;
        if (previousLastScope && previousLastScope === "keyword.action.unknown.filter") {
            result = result.concat(this.suggestions.blocks, this.suggestions.actions, this.suggestions.filters, this.suggestions.extraBlocks);
        }
        else if (lastScope === "source.filter") {
            result = result.concat(this.suggestions.blocks, this.suggestions.extraBlocks);
        }
        else if (lastScope === "line.empty.filter" || lastScope === "line.unknown.filter") {
            if (cursorScopes.indexOf("block.filter") === -1) {
                result = result.concat(this.suggestions.blocks, this.suggestions.extraBlocks);
            }
            else {
                result = result.concat(this.suggestions.blocks, this.suggestions.actions, this.suggestions.filters, this.suggestions.extraBlocks);
            }
        }
        else {
            if (cursorScopes.includes("rarity.filter")) {
                if (this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.rarities);
                }
                if (this.isPotentialOperator(editor, bufferPosition)) {
                    result = result.concat(this.suggestions.operators);
                }
            }
            else if (cursorScopes.includes("identified.filter")) {
                if (prefix !== "Identified" && this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.booleans);
                }
            }
            else if (cursorScopes.includes("corrupted.filter")) {
                if (prefix !== "Corrupted" && this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.booleans);
                }
            }
            else if (cursorScopes.includes("elder-item.filter")) {
                if (prefix !== "ElderItem" && this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.booleans);
                }
            }
            else if (cursorScopes.includes("shaper-item.filter")) {
                if (prefix !== "ShaperItem" && this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.booleans);
                }
            }
            else if (cursorScopes.includes("shaped-map.filter")) {
                if (prefix !== "ShapedMap" && this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.booleans);
                }
            }
            else if (cursorScopes.includes("elder-map.filter")) {
                if (prefix !== "ElderMap" && this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(this.suggestions.booleans);
                }
            }
            else if (cursorScopes.includes("class.filter")) {
                if (prefix !== "Class") {
                    result = result.concat(this.suggestions.classes, this.suggestions.classWhitelist, this.suggestions.extraClasses);
                }
            }
            else if (cursorScopes.includes("base-type.filter")) {
                if (prefix !== "BaseType") {
                    result = result.concat(this.suggestions.bases, this.suggestions.baseWhitelist, this.suggestions.extraBases);
                }
            }
            else if (cursorScopes.includes("socket-group.filter")) {
                if (prefix !== "SocketGroup") {
                    shouldPruneSuggestions = false;
                    if (this.isFirstValue(editor, bufferPosition, true) && prefix.length < 6) {
                        prefix = "";
                        result = result.concat(this.suggestions.sockets);
                    }
                }
            }
            else if (cursorScopes.includes("play-alert-sound.filter")) {
                if (this.isFirstValue(editor, bufferPosition, true)) {
                    result = result.concat(result, this.suggestions.sounds);
                }
            }
            else {
                const numberValueRule = cursorScopes.includes("item-level.filter") ||
                    cursorScopes.includes("drop-level.filter") ||
                    cursorScopes.includes("quality.filter") ||
                    cursorScopes.includes("sockets.filter") ||
                    cursorScopes.includes("linked-sockets.filter") ||
                    cursorScopes.includes("height.filter") ||
                    cursorScopes.includes("width.filter");
                if (numberValueRule) {
                    if (this.isPotentialOperator(editor, bufferPosition)) {
                        result = result.concat(this.suggestions.operators);
                    }
                }
            }
        }
        if (shouldPruneSuggestions)
            result = this.pruneSuggestions(prefix, result);
        this.setReplacementPrefix(editor, bufferPosition, prefix, result);
        return result;
    }
    onDidInsertSuggestion(event) {
        const editor = event.editor;
        if (editor.hasMultipleCursors()) {
            const cursorPositions = editor.getCursorBufferPositions();
            for (const cursorPosition of cursorPositions) {
                this.removeConsecutiveQuotes(editor, cursorPosition);
            }
        }
        else {
            const cursorPosition = editor.getCursorBufferPosition();
            this.removeConsecutiveQuotes(editor, cursorPosition);
        }
        return;
    }
    isPotentialOperator(editor, position) {
        const line = editor.lineTextForBufferRow(position.row);
        const regex = /^\s*\S+\s*(>|<)?$/;
        const result = regex.exec(line);
        if (result)
            return true;
        return false;
    }
    isFirstValue(editor, position, hasOperator) {
        const line = editor.lineTextForBufferRow(position.row);
        const regex = hasOperator ? /^\s*\S+\s*(>=|<=|>|<|=)?\s*\S*(.*)/ : /^\s*\S+\s*\S*(.*)/;
        const result = regex.exec(line);
        if (result) {
            const trailingText = hasOperator ? result[2] : result[1];
            if (trailingText && trailingText.length > 0) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return true;
        }
    }
    getPrefix(editor, position) {
        let previousPositionScopes;
        if (position.column > 0) {
            const previousPosition = new atom_1.Point(position.row, position.column - 1);
            previousPositionScopes = editor.scopeDescriptorForBufferPosition(previousPosition).getScopesArray();
        }
        const previousText = editor.getTextInBufferRange([[position.row, 0], position]);
        let prefix;
        if (previousPositionScopes && previousPositionScopes.indexOf("string.partial-quotation.filter") !== -1) {
            const prefixRegex = /(\"[^"]*)$/;
            const result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[1];
        }
        else if (previousPositionScopes && previousPositionScopes.indexOf("string.quotation.filter") !== -1) {
            const stringRange = editor.bufferRangeForScopeAtCursor("string.quotation.filter");
            if (stringRange.end.column > position.column) {
                const prefixRegex = /(\"[^"]*)$/;
                const result = prefixRegex.exec(previousText);
                if (result)
                    prefix = result[1];
            }
            else {
                const prefixRegex = /(\"[^"]*\")$/;
                const result = prefixRegex.exec(previousText);
                if (result)
                    prefix = result[1];
            }
        }
        else {
            const prefixRegex = /([\s]*([^\s]*))*$/;
            const result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[2];
        }
        if (prefix === undefined)
            prefix = "";
        return prefix;
    }
    pruneSuggestions(prefix, suggestions) {
        if (prefix.length === 0)
            return suggestions;
        const result = [];
        const upperPrefix = prefix.toUpperCase();
        const firstChar = prefix.charAt(0);
        for (const s of suggestions) {
            let text;
            if (s.displayText && firstChar !== '"') {
                text = s.displayText.toUpperCase();
            }
            else if (helpers_1.isSnippetSuggestion(s)) {
                text = s.snippet.toUpperCase();
            }
            else if (helpers_1.isTextSuggestion(s)) {
                text = s.text.toUpperCase();
            }
            else
                continue;
            if (text.indexOf(upperPrefix) !== -1)
                result.push(s);
        }
        return result;
    }
    setReplacementPrefix(editor, position, prefix, suggestions) {
        for (const suggestion of suggestions) {
            let blockElement = false;
            for (const block of this.suggestions.blocks) {
                if (helpers_1.isSnippetSuggestion(suggestion) && helpers_1.isSnippetSuggestion(block)) {
                    if (suggestion.snippet === block.snippet)
                        blockElement = true;
                }
                else if (helpers_1.isTextSuggestion(suggestion) && helpers_1.isTextSuggestion(block)) {
                    if (suggestion.text === block.text)
                        blockElement = true;
                }
            }
            if (blockElement) {
                const range = new atom_1.Range([position.row, 0], position);
                suggestion.replacementPrefix = editor.getTextInBufferRange(range);
            }
            else {
                suggestion.replacementPrefix = prefix;
            }
        }
        return;
    }
    removeConsecutiveQuotes(editor, position) {
        const leftCharLocation = new atom_1.Range([position.row, position.column - 1], position);
        const rightCharLocation = new atom_1.Range(position, [position.row, position.column + 1]);
        const leftChar = editor.getTextInBufferRange(leftCharLocation);
        const rightChar = editor.getTextInBufferRange(rightCharLocation);
        if (leftChar === '"' && rightChar === '"') {
            editor.setTextInBufferRange(rightCharLocation, "", { undo: "skip" });
        }
        return;
    }
}
exports.CompletionProvider = CompletionProvider;
