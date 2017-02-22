"use strict";
var atom_1 = require("atom");
var settings = require("./settings");
var data = require("./data");
var suggestionsData = require("../data/suggestions.json");
var validBases = new Array();
var validClasses = new Array();
var injectedBases = new Array();
var injectedClasses = new Array();
var subscriptions = new atom_1.CompositeDisposable;
function updateItemData(externalCall) {
    if (externalCall === void 0) { externalCall = true; }
    validBases = new Array();
    validClasses = new Array();
    data.itemData.forEach(function (value, key) {
        var knownClass = false;
        for (var _i = 0, validClasses_1 = validClasses; _i < validClasses_1.length; _i++) {
            var c = validClasses_1[_i];
            if (c.text == key) {
                knownClass = true;
            }
        }
        if (!knownClass) {
            if (key.indexOf(' ') != -1)
                validClasses.push({ text: '"' + key + '"',
                    displayText: key });
            else
                validClasses.push({ text: key, displayText: key });
        }
        value.forEach(function (v) {
            if (v.indexOf(' ') != -1)
                validBases.push({ text: '"' + v + '"',
                    displayText: v, custom: { backupRightLabel: key } });
            else
                validBases.push({ text: v, displayText: v, custom: {
                        backupRightLabel: key
                    } });
        });
    });
    if (externalCall)
        updateDecorations();
}
function updateWhitelists(externalCall) {
    if (externalCall === void 0) { externalCall = true; }
    injectedBases = new Array();
    injectedClasses = new Array();
    var bases = settings.config.dataSettings.baseWhitelist.get();
    var classes = settings.config.dataSettings.classWhitelist.get();
    var labelText = "Whitelisted";
    for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
        var c = classes_1[_i];
        if (c.indexOf(' ') != -1)
            injectedClasses.push({ text: '"' + c + '"',
                displayText: c, custom: { backupRightLabel: labelText } });
        else
            injectedClasses.push({ text: c, displayText: c, custom: {
                    backupRightLabel: labelText
                } });
    }
    for (var _a = 0, bases_1 = bases; _a < bases_1.length; _a++) {
        var b = bases_1[_a];
        if (b.indexOf(' ') != -1)
            injectedBases.push({ text: '"' + b + '"',
                displayText: b, custom: { backupRightLabel: labelText } });
        else
            injectedBases.push({ text: b, displayText: b, custom: {
                    backupRightLabel: labelText
                } });
    }
    if (externalCall)
        updateDecorations();
}
function updateDecorations() {
    var enableRightLabel = settings.config.completionSettings.enableRightLabel.get();
    var enableIcon = settings.config.completionSettings.enableIcon.get();
    var action = function (s) {
        if (enableRightLabel && s.custom && s.custom.backupRightLabel) {
            s.rightLabel = s.custom.backupRightLabel;
        }
        else {
            s.rightLabel = undefined;
        }
        if (enableIcon) { }
    };
    validBases.forEach(action);
    injectedClasses.forEach(action);
    injectedBases.forEach(action);
    for (var key in suggestionsData) {
        var sb = suggestionsData[key];
        sb.forEach(action);
    }
}
function setupSubscriptions() {
    subscriptions = new atom_1.CompositeDisposable;
    data.emitter.on("poe-did-update-item-data", updateItemData);
    data.emitter.on("poe-did-update-injected-data", updateWhitelists);
    subscriptions.add(settings.config.completionSettings.enableRightLabel.onDidChange(updateDecorations));
    subscriptions.add(settings.config.completionSettings.enableIcon.onDidChange(updateDecorations));
    updateItemData(false);
    updateWhitelists(false);
    updateDecorations();
}
exports.setupSubscriptions = setupSubscriptions;
function removeSubscriptions() {
    subscriptions.dispose();
}
exports.removeSubscriptions = removeSubscriptions;
function isFirstValue(editor, position, hasOperator) {
    var line = editor.lineTextForBufferRow(position.row);
    var regex;
    if (hasOperator) {
        regex = new RegExp('^\\s*\\S+\\s*(>=|<=|>|<|=)?\\s*\\S*(.*)');
    }
    else {
        regex = new RegExp('^\\s*\\S+\\s*\\S*(.*)');
    }
    var result = regex.exec(line);
    if (result) {
        var trailingText = result[2];
        if (trailingText.length > 0)
            return false;
        else
            return true;
    }
    else {
        return true;
    }
}
function getPrefix(editor, position) {
    var previousPositionScopes;
    if (position.column > 0) {
        var previousPosition = new atom_1.Point(position.row, position.column - 1);
        previousPositionScopes = editor.scopeDescriptorForBufferPosition(previousPosition).scopes;
    }
    var previousText = editor.getTextInBufferRange([[position.row, 0], position]);
    var prefix;
    if (previousPositionScopes && previousPositionScopes.indexOf('string.partial-quotation.poe') != -1) {
        var prefixRegex = /(\"[^"]*)$/;
        var result = prefixRegex.exec(previousText);
        if (result)
            prefix = result[1];
    }
    else if (previousPositionScopes && previousPositionScopes.indexOf('string.quotation.poe') != -1) {
        var stringRange = editor.bufferRangeForScopeAtCursor('string.quotation.poe');
        if (stringRange.end.column > position.column) {
            var prefixRegex = /(\"[^"]*)$/;
            var result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[1];
        }
        else {
            var prefixRegex = /(\"[^"]*\")$/;
            var result = prefixRegex.exec(previousText);
            if (result)
                prefix = result[1];
        }
    }
    else {
        var prefixRegex = /([\s]*([^\s]*))*$/;
        var result = prefixRegex.exec(previousText);
        if (result)
            prefix = result[2];
    }
    if (prefix == undefined)
        prefix = '';
    return prefix;
}
function setReplacementPrefix(editor, position, prefix, suggestions) {
    for (var _i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
        var suggestion = suggestions_1[_i];
        var blockElement = false;
        for (var _a = 0, _b = suggestionsData.blocks; _a < _b.length; _a++) {
            var block = _b[_a];
            if (suggestion.snippet && block.snippet) {
                if (suggestion.snippet == block.snippet) {
                    blockElement = true;
                }
            }
            else if (suggestion.text && block.text) {
                if (suggestion.text == block.text) {
                    blockElement = true;
                }
            }
        }
        if (blockElement) {
            var range = new atom_1.Range([position.row, 0], position);
            suggestion.replacementPrefix = editor.getTextInBufferRange(range);
        }
        else {
            suggestion.replacementPrefix = prefix;
        }
    }
    return suggestions;
}
function pruneSuggestions(prefix, suggestions) {
    if (prefix.length == 0)
        return suggestions;
    var upperPrefix = prefix.toUpperCase();
    var prunedSuggestions = new Array();
    var firstChar = prefix.charAt(0);
    for (var _i = 0, suggestions_2 = suggestions; _i < suggestions_2.length; _i++) {
        var s = suggestions_2[_i];
        var text;
        if (s.displayText && firstChar != '"') {
            text = s.displayText.toUpperCase();
        }
        else if (s.snippet) {
            text = s.snippet.toUpperCase();
        }
        else if (s.text) {
            text = s.text.toUpperCase();
        }
        else
            continue;
        if (text.indexOf(upperPrefix) != -1)
            prunedSuggestions.push(s);
    }
    return prunedSuggestions;
}
function getSuggestions(args) {
    if (!settings.config.generalSettings.enableCompletion.get()) {
        return [];
    }
    var suggestions = new Array();
    var shouldPruneSuggestions = true;
    var prefix = getPrefix(args.editor, args.bufferPosition);
    var cursorScopes = args.scopeDescriptor.scopes;
    var topScope = cursorScopes[cursorScopes.length - 1];
    if (topScope == 'source.poe') {
        suggestions = suggestions.concat(suggestionsData.blocks);
    }
    else if (topScope == 'line.empty.poe' || topScope == 'line.unknown.poe') {
        if (cursorScopes.indexOf('block.poe') != -1) {
            if (prefix == 'Rule') {
                suggestions = suggestions.concat(suggestionsData.actions, suggestionsData.filters);
                shouldPruneSuggestions = false;
            }
            else {
                suggestions = suggestions.concat(suggestionsData.blocks, suggestionsData.actions, suggestionsData.filters);
                if (settings.config.completionSettings.enableExtraSuggestions.get()) {
                    suggestions = suggestions.concat(suggestionsData.extraBlocks);
                }
            }
        }
    }
    else {
        if (cursorScopes.indexOf('filter.rarity.poe') != -1) {
            if (prefix == '[operator]') {
                suggestions = suggestions.concat(suggestionsData.operators, suggestionsData.rarities);
                shouldPruneSuggestions = false;
            }
            else if (prefix == 'rarity') {
                suggestions = suggestions.concat(suggestionsData.rarities);
                shouldPruneSuggestions = false;
            }
            else if (isFirstValue(args.editor, args.bufferPosition, true)) {
                suggestions = suggestions.concat(suggestionsData.rarities);
            }
        }
        else if (cursorScopes.indexOf('filter.identified.poe') != -1) {
            if (prefix == 'True|False') {
                suggestions = suggestions.concat(suggestionsData.booleans);
                shouldPruneSuggestions = false;
            }
            else if (!(prefix == "Identified")) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(suggestionsData.booleans);
                }
            }
        }
        else if (cursorScopes.indexOf('filter.corrupted.poe') != -1) {
            if (prefix == 'True|False') {
                suggestions = suggestions.concat(suggestionsData.booleans);
                shouldPruneSuggestions = false;
            }
            else if (!(prefix == "Corrupted")) {
                if (isFirstValue(args.editor, args.bufferPosition, true)) {
                    suggestions = suggestions.concat(suggestionsData.booleans);
                }
            }
        }
        else if (cursorScopes.indexOf('filter.class.poe') != -1) {
            if (prefix == "class") {
                suggestions = suggestions.concat(validClasses, injectedClasses);
                shouldPruneSuggestions = false;
            }
            else if (!(prefix == "Class")) {
                suggestions = suggestions.concat(validClasses, injectedClasses);
            }
        }
        else if (cursorScopes.indexOf('filter.base-type.poe') != -1) {
            if (prefix == "type") {
                suggestions = suggestions.concat(validBases, injectedBases);
                shouldPruneSuggestions = false;
            }
            else if (!(prefix == "BaseType")) {
                suggestions = suggestions.concat(validBases, injectedBases);
            }
            if (settings.config.completionSettings.enableExtraSuggestions.get()) {
                suggestions = suggestions.concat(suggestionsData.extraBases);
            }
        }
        else {
            var numberValueRule = cursorScopes.indexOf('filter.item-level.poe') != 1 ||
                cursorScopes.indexOf('filter.drop-level.poe') != 1 ||
                cursorScopes.indexOf('filter.quality.poe') != 1 ||
                cursorScopes.indexOf('filter.socket.poe') != 1 ||
                cursorScopes.indexOf('filter.linked-sockets.poe') != 1 ||
                cursorScopes.indexOf('filter.height.poe') != 1 ||
                cursorScopes.indexOf('filter.width.poe') != 1;
            if (numberValueRule) {
                if (prefix == "[operator]") {
                    suggestions = suggestions.concat(suggestionsData.operators);
                    shouldPruneSuggestions = false;
                }
            }
        }
    }
    setReplacementPrefix(args.editor, args.bufferPosition, prefix, suggestions);
    if (shouldPruneSuggestions) {
        suggestions = pruneSuggestions(prefix, suggestions);
    }
    return suggestions;
}
function removeConsecutiveQuotes(editor, position) {
    var leftCharLocation = new atom_1.Range([position.row, position.column - 1], position);
    var rightCharLocation = new atom_1.Range(position, [position.row,
        position.column + 1]);
    var leftChar = editor.getTextInBufferRange(leftCharLocation);
    var rightChar = editor.getTextInBufferRange(rightCharLocation);
    if (leftChar == '"' && rightChar == '"') {
        editor.setTextInBufferRange(rightCharLocation, "", { undo: 'skip' });
    }
}
function removeRarityPlaceholder(editor, startPosition) {
    var endPosition = new atom_1.Point(startPosition.row, startPosition.column + 7);
    var text = editor.getTextInBufferRange([startPosition, endPosition]);
    if (text == ' rarity') {
        editor.setTextInBufferRange([startPosition, endPosition], '', { undo: 'skip' });
    }
}
function insertedSuggestion(params) {
    if (params.editor.hasMultipleCursors()) {
        var cursorPositions = params.editor.getCursorBufferPositions();
        for (var _i = 0, cursorPositions_1 = cursorPositions; _i < cursorPositions_1.length; _i++) {
            var cursorPosition = cursorPositions_1[_i];
            removeConsecutiveQuotes(params.editor, cursorPosition);
        }
    }
    else {
        var cursorPosition_1 = params.editor.getCursorBufferPosition();
        removeConsecutiveQuotes(params.editor, cursorPosition_1);
    }
    if (params.suggestion.custom && params.suggestion.custom.itemRarity) {
        if (params.editor.hasMultipleCursors()) {
            var cursorPositions = params.editor.getCursorBufferPositions();
            for (var _a = 0, cursorPositions_2 = cursorPositions; _a < cursorPositions_2.length; _a++) {
                var cursorPosition = cursorPositions_2[_a];
                removeRarityPlaceholder(params.editor, cursorPosition);
            }
        }
        else {
            var cursorPosition_2 = params.editor.getCursorBufferPosition();
            removeRarityPlaceholder(params.editor, cursorPosition_2);
        }
    }
}
exports.provider = {
    selector: '.source.poe',
    disableForSelector: '.source.poe .comment',
    inclusionPriority: 1,
    excludeLowerPriority: true,
    getSuggestions: getSuggestions,
    onDidInsertSuggestion: insertedSuggestion
};
